const Activity = require("../models/Activity");
const Contact = require("../models/Contact");
const Deal = require("../models/Deal");
const PipelineStage = require("../models/PipelineStage");
const Task = require("../models/Task");
const { generateCopilotResponse } = require("../services/aiService");
const { getOwnedOrAssignedScope } = require("../utils/permissionScopes");

const buildCopilotSnapshot = async (user, pageContext, orgId) => {
  const contactScope = { orgId, ...getOwnedOrAssignedScope(user) };
  const taskScope = { orgId, ...getOwnedOrAssignedScope(user) };
  const privileged = user.role === "admin" || user.role === "manager";
  const dealScope = privileged
    ? { orgId }
    : {
        orgId,
        $or: [{ owner: user._id }, { assignedTo: user._id }],
      };
  const now = new Date();
  const nextThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

  const [
    totalContacts,
    totalDeals,
    totalTasks,
    overdueTasks,
    dueSoonTasks,
    openDeals,
    wonDeals,
    contacts,
    deals,
    tasks,
    activities,
    stages,
    contactStatusRaw,
    taskStatusRaw,
  ] =
    await Promise.all([
      Contact.countDocuments(contactScope),
      Deal.countDocuments(dealScope),
      Task.countDocuments(taskScope),
      Task.countDocuments({
        ...taskScope,
        dueDate: { $lt: now },
        status: { $ne: "completed" },
      }),
      Task.countDocuments({
        ...taskScope,
        dueDate: { $gte: now, $lte: nextThreeDays },
        status: { $ne: "completed" },
      }),
      Deal.countDocuments({
        ...dealScope,
        status: "open",
      }),
      Deal.countDocuments({
        ...dealScope,
        status: "won",
      }),
      Contact.find(contactScope)
        .sort({ updatedAt: -1 })
        .limit(6)
        .select("firstName lastName company status source notes tags createdAt"),
      Deal.find(dealScope)
        .sort({ updatedAt: -1 })
        .limit(6)
        .select("title value currency status stage expectedCloseDate notes updatedAt"),
      Task.find(taskScope)
        .sort({ dueDate: 1, updatedAt: -1 })
        .limit(6)
        .select("title status priority dueDate description"),
      Activity.find({ owner: user._id, orgId })
        .sort({ createdAt: -1 })
        .limit(8)
        .select("message action createdAt"),
      PipelineStage.find(privileged ? { orgId } : { owner: user._id, orgId })
        .sort({ order: 1 })
        .select("name color"),
      Contact.aggregate([
        { $match: contactScope },
        { $group: { _id: "$status", value: { $sum: 1 } } },
      ]),
      Task.aggregate([
        { $match: taskScope },
        { $group: { _id: "$status", value: { $sum: 1 } } },
      ]),
    ]);

  const stageMap = new Map(
    stages.map((stage) => [String(stage._id), stage.name]),
  );

  const riskyDeals = deals
    .filter((deal) => {
      const closeDate = deal.expectedCloseDate ? new Date(deal.expectedCloseDate) : null;
      const stale = new Date(deal.updatedAt) < new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const closingSoon = closeDate && closeDate <= nextThreeDays;
      return deal.status === "open" && (stale || closingSoon);
    })
    .slice(0, 4)
    .map((deal) => ({
      title: deal.title,
      stage: stageMap.get(String(deal.stage)) || "Unknown Stage",
      value: deal.value,
      currency: deal.currency,
      expectedCloseDate: deal.expectedCloseDate,
    }));

  const hotLeads = contacts
    .filter((contact) => ["qualified", "proposal"].includes(contact.status))
    .slice(0, 4)
    .map((contact) => ({
      fullName: `${contact.firstName} ${contact.lastName}`.trim(),
      company: contact.company,
      status: contact.status,
      source: contact.source,
      createdAt: contact.createdAt,
    }));

  return {
    pageContext,
    user: {
      name: user.name,
      role: user.role,
    },
    metrics: {
      totalContacts,
      totalDeals,
      totalTasks,
      overdueTasks,
      dueSoonTasks,
      openDeals,
      wonDeals,
    },
    distributions: {
      contactStatus: contactStatusRaw.map((item) => ({
        name: item._id,
        value: item.value,
      })),
      taskStatus: taskStatusRaw.map((item) => ({
        name: item._id,
        value: item.value,
      })),
    },
    hotLeads,
    riskyDeals,
    contacts: contacts.map((contact) => ({
      fullName: `${contact.firstName} ${contact.lastName}`.trim(),
      company: contact.company,
      status: contact.status,
      source: contact.source,
      tags: contact.tags,
      notes: contact.notes,
    })),
    deals: deals.map((deal) => ({
      title: deal.title,
      value: deal.value,
      currency: deal.currency,
      status: deal.status,
      stage: stageMap.get(String(deal.stage)) || "Unknown Stage",
      expectedCloseDate: deal.expectedCloseDate,
      notes: deal.notes,
    })),
    tasks: tasks.map((task) => ({
      title: task.title,
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate,
      description: task.description,
    })),
    activities: activities.map((activity) => ({
      message: activity.message,
      action: activity.action,
      createdAt: activity.createdAt,
    })),
  };
};

const chatWithCopilot = async (request, response) => {
  const prompt = String(request.body.prompt || "").trim();
  const pageContext = String(request.body.pageContext || "dashboard").trim();
  const conversation = Array.isArray(request.body.conversation)
    ? request.body.conversation.slice(-6)
    : [];

  if (!prompt) {
    response.status(400);
    throw new Error("Prompt is required");
  }

  const snapshot = await buildCopilotSnapshot(request.user, pageContext, request.orgId);
  const reply = await generateCopilotResponse({
    prompt,
    snapshot,
    conversation,
  });

  response.status(200).json({
    success: true,
    message: "Copilot response generated successfully",
    data: {
      reply,
    },
  });
};

module.exports = {
  chatWithCopilot,
};
