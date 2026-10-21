const cron = require("node-cron");

const AutomationExecution = require("../models/AutomationExecution");
const AutomationRule = require("../models/AutomationRule");
const Contact = require("../models/Contact");
const Task = require("../models/Task");
const User = require("../models/User");
const { logActivity } = require("./activityService");
const { createNotification } = require("./notificationService");
const { renderTemplate, sendEmail } = require("./emailService");

let schedulerStarted = false;

const mapRule = (rule) => rule.toSafeObject();

const mapExecution = (execution) => ({
  ...execution.toSafeObject(),
  rule: execution.rule
    ? {
        id: execution.rule._id || execution.rule.id,
        name: execution.rule.name,
        triggerType: execution.rule.triggerType,
        actionType: execution.rule.actionType,
      }
    : null,
});

const wasAlreadyExecuted = async (ruleId, executionKey) => {
  if (!executionKey) {
    return false;
  }

  const existingExecution = await AutomationExecution.findOne({
    rule: ruleId,
    executionKey,
  });

  return Boolean(existingExecution);
};

const createExecution = async ({
  owner,
  orgId,
  rule,
  entityType,
  entityId = null,
  status,
  message,
  metadata = {},
  executionKey = "",
}) =>
  AutomationExecution.create({
    owner,
    orgId,
    rule,
    entityType,
    entityId,
    status,
    message,
    metadata,
    executionKey:
      executionKey && executionKey.length > 0
        ? executionKey
        : `${rule || "rule"}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
  });

const executeContactAgeEmail = async (rule) => {
  const delayDays = Number(rule.config.delayDays || 2);
  const subjectTemplate =
    rule.config.subject || "Checking in with {{firstName}} from {{company}}";
  const bodyTemplate =
    rule.config.body ||
    "Hi {{firstName}},\n\nJust following up after a few days. Let us know if you would like to continue the conversation.\n\nRegards,\n{{senderName}}";

  const threshold = new Date(Date.now() - delayDays * 24 * 60 * 60 * 1000);
  const contacts = await Contact.find({
    owner: rule.owner,
    orgId: rule.orgId,
    createdAt: { $lte: threshold },
    status: { $in: ["lead", "qualified", "proposal"] },
  });

  let processed = 0;

  for (const contact of contacts) {
    const executionKey = `${rule._id}:contact:${contact._id}:age_email`;

    if (await wasAlreadyExecuted(rule._id, executionKey)) {
      continue;
    }

    const owner = await User.findById(rule.owner).select("name email role");
    const variables = {
      firstName: contact.firstName,
      lastName: contact.lastName,
      fullName: `${contact.firstName} ${contact.lastName}`.trim(),
      company: contact.company || "your company",
      email: contact.email,
      senderName: owner?.name || "Orbit CRM",
    };

    try {
      await sendEmail({
        to: contact.email,
        subject: renderTemplate(subjectTemplate, variables),
        body: renderTemplate(bodyTemplate, variables),
      });

      await createExecution({
        owner: rule.owner,
        orgId: rule.orgId,
        rule: rule._id,
        entityType: "contact",
        entityId: contact._id,
        status: "success",
        message: `Automation email sent to ${contact.email}`,
        executionKey,
      });

      await logActivity({
        owner: rule.owner,
        actor: rule.owner,
        entityType: "contact",
        entityId: contact._id,
        action: "automation_email_sent",
        message: `Automation follow-up email sent to ${contact.email}`,
      });

      processed += 1;
    } catch (error) {
      await createExecution({
        owner: rule.owner,
        orgId: rule.orgId,
        rule: rule._id,
        entityType: "contact",
        entityId: contact._id,
        status: "failed",
        message: error.message,
        metadata: { email: contact.email },
        executionKey,
      });
    }
  }

  return processed;
};

const executeLeadAssignment = async (rule) => {
  const assigneeId = rule.config.assigneeId;

  if (!assigneeId) {
    await createExecution({
      owner: rule.owner,
      orgId: rule.orgId,
      rule: rule._id,
      entityType: "system",
      status: "failed",
      message: "Automation assignee is not configured",
    });
    return 0;
  }

  const assignee = await User.findOne({ _id: assigneeId, isActive: true, orgId: rule.orgId });

  if (!assignee) {
    await createExecution({
      owner: rule.owner,
      orgId: rule.orgId,
      rule: rule._id,
      entityType: "system",
      status: "failed",
      message: "Configured automation assignee was not found",
    });
    return 0;
  }

  const contacts = await Contact.find({
    owner: rule.owner,
    orgId: rule.orgId,
    status: "lead",
    $or: [{ assignedTo: null }, { assignedTo: { $exists: false } }],
  }).sort({ createdAt: 1 });

  let processed = 0;

  for (const contact of contacts) {
    const executionKey = `${rule._id}:contact:${contact._id}:assign`;

    if (await wasAlreadyExecuted(rule._id, executionKey)) {
      continue;
    }

    contact.assignedTo = assignee._id;
    await contact.save();

    await createExecution({
      owner: rule.owner,
      orgId: rule.orgId,
      rule: rule._id,
      entityType: "contact",
      entityId: contact._id,
      status: "success",
      message: `Lead auto-assigned to ${assignee.name}`,
      metadata: { assigneeId: assignee._id, assigneeName: assignee.name },
      executionKey,
    });

    await logActivity({
      owner: rule.owner,
      actor: rule.owner,
      entityType: "contact",
      entityId: contact._id,
      action: "automation_contact_assigned",
      message: `Lead ${contact.firstName} ${contact.lastName} auto-assigned to ${assignee.name}`,
    });

    await createNotification({
      owner: rule.owner,
      orgId: rule.orgId,
      recipient: assignee._id,
      actor: rule.owner,
      type: "lead_assigned",
      title: "Lead assigned by automation",
      message: `${contact.firstName} ${contact.lastName} was assigned to you by an automation rule.`,
      entityType: "contact",
      entityId: contact._id,
      metadata: { assigneeName: assignee.name },
      dedupeKey: `automation-lead-assigned:${rule._id}:${contact._id}:${assignee._id}`,
    });

    processed += 1;
  }

  return processed;
};

const executeOverdueTaskFollowup = async (rule) => {
  const tasks = await Task.find({
    owner: rule.owner,
    orgId: rule.orgId,
    dueDate: { $lt: new Date() },
    status: { $nin: ["completed", "overdue"] },
  })
    .populate("assignedTo", "name email role")
    .sort({ dueDate: 1 });

  let processed = 0;

  for (const task of tasks) {
    const executionKey = `${rule._id}:task:${task._id}:overdue`;

    if (await wasAlreadyExecuted(rule._id, executionKey)) {
      continue;
    }

    task.status = "overdue";
    await task.save();

    await createExecution({
      owner: rule.owner,
      orgId: rule.orgId,
      rule: rule._id,
      entityType: "task",
      entityId: task._id,
      status: "success",
      message: `Task marked overdue for ${task.assignedTo?.name || "assignee"}`,
      metadata: { dueDate: task.dueDate, assignedTo: task.assignedTo?._id || null },
      executionKey,
    });

    await logActivity({
      owner: rule.owner,
      actor: rule.owner,
      entityType: "task",
      entityId: task._id,
      action: "automation_task_overdue",
      message: `Task "${task.title}" auto-marked overdue`,
    });

    if (task.assignedTo?._id) {
      await createNotification({
        owner: rule.owner,
        orgId: rule.orgId,
        recipient: task.assignedTo._id,
        actor: rule.owner,
        type: "task_overdue",
        title: "Task marked overdue",
        message: `Task "${task.title}" was marked overdue by an automation rule.`,
        entityType: "task",
        entityId: task._id,
        metadata: { dueDate: task.dueDate },
        dedupeKey: `automation-overdue:${rule._id}:${task._id}`,
      });
    }

    processed += 1;
  }

  return processed;
};

const executeAutomationRule = async (rule) => {
  if (!rule.isActive) {
    return 0;
  }

  switch (rule.triggerType) {
    case "contact_age_days":
      return executeContactAgeEmail(rule);
    case "new_unassigned_lead":
      return executeLeadAssignment(rule);
    case "overdue_task":
      return executeOverdueTaskFollowup(rule);
    default:
      return 0;
  }
};

const executeLeadCreatedRule = async (rule, contact) => {
  if (!rule.isActive) return 0;
  const matchSource = String(rule.config.matchSource || "").toLowerCase() || "facebook ads";
  const contactSource = String(contact.source || "").toLowerCase();
  if (contactSource !== matchSource) return 0;

  const assigneeId = rule.config.assigneeId;
  const messageTemplate =
    rule.config.whatsappMessage ||
    "Hi {{name}}, thanks for reaching out from Facebook. Our sales rep will contact you shortly.";

  if (assigneeId) {
    const assignee = await User.findOne({ _id: assigneeId, orgId: rule.orgId, isActive: true });
    if (!assignee) {
      await createExecution({
        owner: rule.owner,
        orgId: rule.orgId,
        rule: rule._id,
        entityType: "contact",
        entityId: contact._id,
        status: "failed",
        message: "Assignee not found for lead_created rule",
      });
      return 0;
    }

    contact.assignedTo = assignee._id;
    await contact.save();

    await createNotification({
      owner: rule.owner,
      orgId: rule.orgId,
      recipient: assignee._id,
      actor: rule.owner,
      type: "lead_assigned",
      title: "Lead assigned by automation",
      message: `${contact.firstName} ${contact.lastName} was assigned to you (source: ${contact.source || "unknown"}).`,
      entityType: "contact",
      entityId: contact._id,
      metadata: { source: contact.source, message: messageTemplate },
      dedupeKey: `automation-lead-created:${rule._id}:${contact._id}:${assignee._id}`,
    });
  }

  await createExecution({
    owner: rule.owner,
    orgId: rule.orgId,
    rule: rule._id,
    entityType: "contact",
    entityId: contact._id,
    status: "success",
    message: `Lead created matched rule (source=${contact.source || "n/a"})`,
    metadata: { source: contact.source },
    executionKey: `lead-created:${rule._id}:${contact._id}`,
  });

  await logActivity({
    owner: rule.owner,
    actor: rule.owner,
    entityType: "contact",
    entityId: contact._id,
    action: "automation_lead_created",
    message: `Lead matched automation rule (${rule.name}); assigned and WhatsApp placeholder sent.`,
    metadata: { source: contact.source },
  });

  return 1;
};

const handleLeadCreatedEvent = async (contact) => {
  const rules = await AutomationRule.find({
    orgId: contact.orgId,
    isActive: true,
    triggerType: "lead_created",
  });

  let processed = 0;
  for (const rule of rules) {
    processed += await executeLeadCreatedRule(rule, contact);
  }
  return processed;
};

const executeContactUpdatedRule = async (rule, contact) => {
  if (!rule.isActive) return 0;
  const matchSource = String(rule.config.matchSource || "").toLowerCase() || "facebook ads";
  const contactSource = String(contact.source || "").toLowerCase();
  if (contactSource !== matchSource) return 0;

  const assigneeId = rule.config.assigneeId;
  const messageTemplate =
    rule.config.whatsappMessage ||
    "Hi {{name}}, thanks for reaching out. Our rep will contact you shortly.";

  if (assigneeId) {
    const assignee = await User.findOne({ _id: assigneeId, orgId: rule.orgId, isActive: true });
    if (!assignee) {
      await createExecution({
        owner: rule.owner,
        orgId: rule.orgId,
        rule: rule._id,
        entityType: "contact",
        entityId: contact._id,
        status: "failed",
        message: "Assignee not found for contact_updated rule",
      });
      return 0;
    }

    contact.assignedTo = assignee._id;
    await contact.save();

    await createNotification({
      owner: rule.owner,
      orgId: rule.orgId,
      recipient: assignee._id,
      actor: rule.owner,
      type: "lead_assigned",
      title: "Lead assigned by automation",
      message: `${contact.firstName} ${contact.lastName} was assigned to you (updated, source: ${contact.source || "unknown"}).`,
      entityType: "contact",
      entityId: contact._id,
      metadata: { source: contact.source, message: messageTemplate },
      dedupeKey: `automation-contact-updated:${rule._id}:${contact._id}:${assignee._id}`,
    });
  }

  await createExecution({
    owner: rule.owner,
    orgId: rule.orgId,
    rule: rule._id,
    entityType: "contact",
    entityId: contact._id,
    status: "success",
    message: `Contact updated matched rule (source=${contact.source || "n/a"})`,
    metadata: { source: contact.source },
    executionKey: `contact-updated:${rule._id}:${contact._id}`,
  });

  await logActivity({
    owner: rule.owner,
    actor: rule.owner,
    entityType: "contact",
    entityId: contact._id,
    action: "automation_contact_updated",
    message: `Contact matched automation rule (${rule.name}); assigned and WhatsApp placeholder sent.`,
    metadata: { source: contact.source },
  });

  return 1;
};

const handleContactUpdatedEvent = async (contact) => {
  const rules = await AutomationRule.find({
    orgId: contact.orgId,
    isActive: true,
    triggerType: "contact_updated",
  });

  let processed = 0;
  for (const rule of rules) {
    processed += await executeContactUpdatedRule(rule, contact);
  }
  return processed;
};

const runAutomationCycle = async () => {
  const activeRules = await AutomationRule.find({ isActive: true }).sort({
    createdAt: 1,
  });

  for (const rule of activeRules) {
    try {
      await executeAutomationRule(rule);
      rule.lastRunAt = new Date();
      await rule.save();
    } catch (error) {
      await createExecution({
        owner: rule.owner,
        orgId: rule.orgId,
        rule: rule._id,
        entityType: "system",
        status: "failed",
        message: error.message,
      });
    }
  }
};

const startAutomationScheduler = () => {
  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;

  cron.schedule("* * * * *", async () => {
    try {
      await runAutomationCycle();
    } catch (error) {
      console.error("Automation scheduler run failed:", error.message);
    }
  });
};

module.exports = {
  executeAutomationRule,
  handleLeadCreatedEvent,
  handleContactUpdatedEvent,
  mapExecution,
  mapRule,
  runAutomationCycle,
  startAutomationScheduler,
};
