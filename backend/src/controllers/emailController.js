const Contact = require("../models/Contact");
const EmailLog = require("../models/EmailLog");
const EmailTemplate = require("../models/EmailTemplate");
const { logActivity } = require("../services/activityService");
const { generateEmailDraft } = require("../services/aiService");
const { renderTemplate, sendEmail } = require("../services/emailService");
const formatMongooseError = require("../utils/catchValidationError");

const DEFAULT_TEMPLATES = [
  {
    name: "Welcome Intro",
    slug: "welcome-intro",
    subject: "Welcome to {{company}}",
    body:
      "Hi {{firstName}},\n\nThanks for connecting with {{senderName}} from {{company}}. We would love to help you streamline your CRM workflow.\n\nRegards,\n{{senderName}}",
  },
  {
    name: "Follow Up",
    slug: "follow-up",
    subject: "Quick follow up for {{company}}",
    body:
      "Hi {{firstName}},\n\nJust following up on our previous conversation. Let me know a good time to reconnect.\n\nBest,\n{{senderName}}",
  },
  {
    name: "Proposal Reminder",
    slug: "proposal-reminder",
    subject: "Proposal update for {{company}}",
    body:
      "Hi {{firstName}},\n\nSharing a quick reminder regarding the proposal. Happy to answer any questions from your team.\n\nThanks,\n{{senderName}}",
  },
];

const ensureDefaultTemplates = async (ownerId, orgId) => {
  const existingTemplates = await EmailTemplate.find({ owner: ownerId, orgId }).sort({
    createdAt: -1,
  });

  if (existingTemplates.length > 0) {
    return existingTemplates;
  }

  await EmailTemplate.insertMany(
    DEFAULT_TEMPLATES.map((template) => ({
      ...template,
      owner: ownerId,
      orgId,
      isDefault: true,
    })),
  );

  return EmailTemplate.find({ owner: ownerId, orgId }).sort({ createdAt: -1 });
};

const mapTemplate = (template) => template.toSafeObject();

const mapEmailLog = (log) => ({
  ...log.toSafeObject(),
  template: log.template
    ? {
        id: log.template._id || log.template.id,
        name: log.template.name,
        slug: log.template.slug,
      }
    : null,
  sentBy: log.sentBy
    ? {
        id: log.sentBy._id || log.sentBy.id,
        name: log.sentBy.name,
        email: log.sentBy.email,
        role: log.sentBy.role,
      }
    : null,
});

const buildVariables = (contact, sender) => ({
  firstName: contact?.firstName || "",
  lastName: contact?.lastName || "",
  fullName:
    contact?.fullName ||
    `${contact?.firstName || ""} ${contact?.lastName || ""}`.trim(),
  company: contact?.company || "your company",
  email: contact?.email || "",
  senderName: sender.name,
  senderEmail: sender.email,
});

const listTemplates = async (request, response) => {
  const templates = await ensureDefaultTemplates(request.user._id, request.orgId);

  response.status(200).json({
    success: true,
    message: "Email templates fetched successfully",
    data: {
      templates: templates.map(mapTemplate),
    },
  });
};

const createTemplate = async (request, response) => {
  try {
    const template = await EmailTemplate.create({
      ...request.body,
      slug: String(request.body.slug || "").trim().toLowerCase(),
      owner: request.user._id,
      orgId: request.orgId,
      isDefault: false,
    });

    response.status(201).json({
      success: true,
      message: "Email template created successfully",
      data: {
        template: mapTemplate(template),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const listEmailLogs = async (request, response) => {
  const logs = await EmailLog.find({ owner: request.user._id, orgId: request.orgId })
    .populate("template", "name slug")
    .populate("sentBy", "name email role")
    .sort({ createdAt: -1 })
    .limit(50);

  response.status(200).json({
    success: true,
    message: "Email logs fetched successfully",
    data: {
      logs: logs.map(mapEmailLog),
    },
  });
};

const createLogRecord = async ({
  owner,
  sentBy,
  orgId,
  template,
  recipients,
  subject,
  body,
  status,
  errorMessage = "",
}) =>
  EmailLog.create({
    owner,
    sentBy,
    orgId,
    template,
    recipients,
    subject,
    body,
    status,
    errorMessage,
  });

const sendSingleEmail = async (request, response) => {
  try {
    const { contactId, templateId, subject, body } = request.body;
    const contact = await Contact.findOne({
      _id: contactId,
      owner: request.user._id,
      orgId: request.orgId,
    });

    if (!contact) {
      response.status(400);
      throw new Error("Valid contact is required");
    }

    const template = templateId
      ? await EmailTemplate.findOne({
          _id: templateId,
          owner: request.user._id,
          orgId: request.orgId,
        })
      : null;

    const variables = buildVariables(contact, request.user);
    const finalSubject = renderTemplate(subject || template?.subject || "", variables);
    const finalBody = renderTemplate(body || template?.body || "", variables);

    if (!finalSubject || !finalBody) {
      response.status(400);
      throw new Error("Subject and body are required");
    }

    try {
      await sendEmail({ to: contact.email, subject: finalSubject, body: finalBody });

      const log = await createLogRecord({
        owner: request.user._id,
        sentBy: request.user._id,
        template: template?._id || null,
        recipients: [{ email: contact.email, contact: contact._id }],
        subject: finalSubject,
        body: finalBody,
        status: "sent",
        orgId: request.orgId,
      });

      await logActivity({
        owner: request.user._id,
        actor: request.user._id,
        entityType: "contact",
        entityId: contact._id,
        action: "email_sent",
        message: `Email sent to ${contact.email}`,
      });

      const populatedLog = await EmailLog.findById(log._id)
        .populate("template", "name slug")
        .populate("sentBy", "name email role");

      response.status(200).json({
        success: true,
        message: "Email sent successfully",
        data: { log: mapEmailLog(populatedLog) },
      });
    } catch (error) {
      await createLogRecord({
        owner: request.user._id,
        sentBy: request.user._id,
        template: template?._id || null,
        recipients: [{ email: contact.email, contact: contact._id }],
        subject: finalSubject,
        body: finalBody,
        status: "failed",
        errorMessage: error.message,
        orgId: request.orgId,
      });

      response.status(500);
      throw new Error(error.message);
    }
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const sendBulkEmail = async (request, response) => {
  try {
    const { contactIds = [], templateId, subject, body } = request.body;

    if (!Array.isArray(contactIds) || contactIds.length === 0) {
      response.status(400);
      throw new Error("At least one contact must be selected");
    }

    const contacts = await Contact.find({
      _id: { $in: contactIds },
      owner: request.user._id,
      orgId: request.orgId,
    });

    if (contacts.length === 0) {
      response.status(400);
      throw new Error("No valid contacts found");
    }

    const template = templateId
      ? await EmailTemplate.findOne({
          _id: templateId,
          owner: request.user._id,
          orgId: request.orgId,
        })
      : null;

    const outcomes = [];

    for (const contact of contacts) {
      const variables = buildVariables(contact, request.user);
      const finalSubject = renderTemplate(subject || template?.subject || "", variables);
      const finalBody = renderTemplate(body || template?.body || "", variables);

      try {
        await sendEmail({ to: contact.email, subject: finalSubject, body: finalBody });

        await createLogRecord({
          owner: request.user._id,
          sentBy: request.user._id,
        template: template?._id || null,
        recipients: [{ email: contact.email, contact: contact._id }],
        subject: finalSubject,
        body: finalBody,
        status: "sent",
        orgId: request.orgId,
      });

        outcomes.push({ email: contact.email, status: "sent" });
      } catch (error) {
        await createLogRecord({
          owner: request.user._id,
          sentBy: request.user._id,
          template: template?._id || null,
        recipients: [{ email: contact.email, contact: contact._id }],
        subject: finalSubject,
        body: finalBody,
        status: "failed",
        errorMessage: error.message,
        orgId: request.orgId,
      });

        outcomes.push({
          email: contact.email,
          status: "failed",
          errorMessage: error.message,
        });
      }
    }

    await logActivity({
      owner: request.user._id,
      actor: request.user._id,
      entityType: "system",
      action: "bulk_email_sent",
      message: `Bulk email processed for ${contacts.length} contacts`,
      metadata: {
        total: contacts.length,
        sent: outcomes.filter((item) => item.status === "sent").length,
      },
    });

    response.status(200).json({
      success: true,
      message: "Bulk email processed successfully",
      data: { outcomes },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const generateAiEmailDraft = async (request, response) => {
  try {
    const { contactId, tone, goal, mode = "single" } = request.body;

    const contact = await Contact.findOne({
      _id: contactId,
      owner: request.user._id,
      orgId: request.orgId,
    });

    if (!contact) {
      response.status(400);
      throw new Error("Valid contact is required for AI email drafting");
    }

    const draft = await generateEmailDraft({
      contact: {
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: `${contact.firstName} ${contact.lastName}`.trim(),
        company: contact.company,
        email: contact.email,
      },
      sender: request.user,
      tone,
      goal,
      mode,
    });

    response.status(200).json({
      success: true,
      message: "AI email draft generated successfully",
      data: {
        draft,
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

module.exports = {
  createTemplate,
  generateAiEmailDraft,
  listEmailLogs,
  listTemplates,
  sendBulkEmail,
  sendSingleEmail,
};
