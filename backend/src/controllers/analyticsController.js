const Activity = require("../models/Activity");
const Contact = require("../models/Contact");
const Deal = require("../models/Deal");
const PipelineStage = require("../models/PipelineStage");
const Task = require("../models/Task");
const User = require("../models/User");
const { generateDashboardAiBrief } = require("../services/aiService");
const { isDatabaseConnected } = require("../utils/demoMode");

const buildEmptyDashboardAnalyticsData = () => ({
  summary: {
    totalContacts: 0,
    totalCustomers: 0,
    activeDeals: 0,
    totalTasks: 0,
    overdueTasks: 0,
    completedTasks: 0,
    wonRevenue: 0,
    conversionRate: 0,
  },
  charts: {
    contactStatus: [],
    taskStatus: [],
    stageValue: [],
    monthlyLeads: [],
    monthlyRevenue: [],
  },
  recentActivities: [],
});

const buildDashboardAnalyticsData = async (ownerId, orgId) => {
  const [
    totalContacts,
    totalCustomers,
    activeDeals,
    totalTasks,
    overdueTasks,
    completedTasks,
    contactStatusRaw,
    taskStatusRaw,
    stageValueRaw,
    monthlyContactsRaw,
    monthlyRevenueRaw,
    recentActivities,
    wonDeals,
    allDeals,
    stages,
  ] = await Promise.all([
    Contact.countDocuments({ owner: ownerId, orgId }),
    Contact.countDocuments({ owner: ownerId, orgId, status: "customer" }),
    Deal.countDocuments({ owner: ownerId, orgId, status: "open" }),
    Task.countDocuments({ owner: ownerId, orgId }),
    Task.countDocuments({
      owner: ownerId,
      orgId,
      dueDate: { $lt: new Date() },
      status: { $ne: "completed" },
    }),
    Task.countDocuments({ owner: ownerId, orgId, status: "completed" }),
    Contact.aggregate([
      { $match: { owner: ownerId, orgId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Task.aggregate([
      { $match: { owner: ownerId, orgId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Deal.aggregate([
      { $match: { owner: ownerId, orgId } },
      {
        $group: {
          _id: "$stage",
          value: { $sum: "$value" },
          deals: { $sum: 1 },
        },
      },
    ]),
    Contact.aggregate([
      { $match: { owner: ownerId, orgId } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
    ]),
    Deal.aggregate([
      { $match: { owner: ownerId, orgId, status: { $in: ["open", "won"] } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          value: { $sum: "$value" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      { $limit: 6 },
    ]),
    Activity.find({ owner: ownerId, orgId })
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(8),
    Deal.aggregate([
      { $match: { owner: ownerId, orgId, status: "won" } },
      { $group: { _id: null, revenue: { $sum: "$value" }, count: { $sum: 1 } } },
    ]),
    Deal.aggregate([
      { $match: { owner: ownerId, orgId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    PipelineStage.find({ owner: ownerId, orgId }).sort({ order: 1 }),
  ]);

  const wonRevenue = wonDeals[0]?.revenue || 0;
  const wonCount = wonDeals[0]?.count || 0;
  const totalDealsCount = allDeals.reduce((sum, item) => sum + item.count, 0);
  const conversionRate =
    totalDealsCount > 0 ? Number(((wonCount / totalDealsCount) * 100).toFixed(1)) : 0;

  const stageMap = new Map(
    stages.map((stage) => [String(stage._id), { name: stage.name, color: stage.color }]),
  );

  const stageValue = stageValueRaw.map((item) => ({
    stage: stageMap.get(String(item._id))?.name || "Unknown Stage",
    color: stageMap.get(String(item._id))?.color || "#64748b",
    value: item.value,
    deals: item.deals,
  }));

  const contactStatus = contactStatusRaw.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  const taskStatus = taskStatusRaw.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  const monthLabel = (year, month) =>
    new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short" });

  const monthlyLeads = monthlyContactsRaw.map((item) => ({
    month: monthLabel(item._id.year, item._id.month),
    leads: item.count,
  }));

  const monthlyRevenue = monthlyRevenueRaw.map((item) => ({
    month: monthLabel(item._id.year, item._id.month),
    revenue: item.value,
  }));

  return {
    summary: {
      totalContacts,
      totalCustomers,
      activeDeals,
      totalTasks,
      overdueTasks,
      completedTasks,
      wonRevenue,
      conversionRate,
    },
    charts: {
      contactStatus,
      taskStatus,
      stageValue,
      monthlyLeads,
      monthlyRevenue,
    },
    recentActivities: recentActivities.map((activity) => activity.toSafeObject()),
  };
};

const listDashboardAnalytics = async (request, response) => {
  if (!isDatabaseConnected()) {
    response.status(200).json({
      success: true,
      message: "Dashboard analytics fetched successfully",
      data: buildEmptyDashboardAnalyticsData(),
    });
    return;
  }

  const data = await buildDashboardAnalyticsData(request.user._id, request.orgId);

  response.status(200).json({
    success: true,
    message: "Dashboard analytics fetched successfully",
    data,
  });
};

const generateDashboardBrief = async (request, response) => {
  if (!isDatabaseConnected()) {
    response.status(200).json({
      success: true,
      message: "AI dashboard brief generated successfully",
      data: {
        brief:
          "Demo mode is active. Dashboard data is unavailable until MongoDB reconnects, but admin access is working.",
      },
    });
    return;
  }

  const analytics = await buildDashboardAnalyticsData(request.user._id, request.orgId);
  const brief = await generateDashboardAiBrief({ analytics });

  response.status(200).json({
    success: true,
    message: "AI dashboard brief generated successfully",
    data: {
      brief,
    },
  });
};

const buildDateRange = (start, end) => {
  const endDate = end ? new Date(end) : new Date();
  const startDate = start
    ? new Date(start)
    : new Date(endDate.getTime() - 90 * 24 * 60 * 60 * 1000);

  endDate.setHours(23, 59, 59, 999);
  startDate.setHours(0, 0, 0, 0);

  return { startDate, endDate };
};

const buildAdvancedReportingData = async (ownerId, orgId, { start, end }) => {
  const { startDate, endDate } = buildDateRange(start, end);
  const dateMatch = {
    $gte: startDate,
    $lte: endDate,
  };

  const [
    contacts,
    deals,
    tasks,
    users,
    leadSourceRaw,
    funnelRaw,
    outcomeRaw,
    revenueTrendRaw,
    overduePriorityRaw,
  ] = await Promise.all([
    Contact.find({
      owner: ownerId,
      orgId,
      createdAt: dateMatch,
    }).select("status source assignedTo createdAt"),
    Deal.find({
      owner: ownerId,
      orgId,
      createdAt: dateMatch,
    }).select("status value assignedTo createdAt"),
    Task.find({
      owner: ownerId,
      orgId,
      createdAt: dateMatch,
    }).select("status priority assignedTo createdAt"),
    User.find({ orgId })
      .select("name email role")
      .sort({ name: 1 }),
    Contact.aggregate([
      { $match: { owner: ownerId, orgId, createdAt: dateMatch } },
      { $group: { _id: "$source", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]),
    Contact.aggregate([
      { $match: { owner: ownerId, orgId, createdAt: dateMatch } },
      { $group: { _id: "$status", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]),
    Deal.aggregate([
      { $match: { owner: ownerId, orgId, createdAt: dateMatch } },
      { $group: { _id: "$status", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]),
    Deal.aggregate([
      {
        $match: {
          owner: ownerId,
          orgId,
          createdAt: dateMatch,
          status: "won",
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$value" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]),
    Task.aggregate([
      {
        $match: {
          owner: ownerId,
          orgId,
          dueDate: { $lt: new Date() },
          status: { $ne: "completed" },
        },
      },
      { $group: { _id: "$priority", value: { $sum: 1 } } },
      { $sort: { value: -1 } },
    ]),
  ]);

  const leadsCreated = contacts.length;
  const qualifiedLeads = contacts.filter((item) =>
    ["qualified", "proposal", "customer"].includes(item.status),
  ).length;
  const wonDeals = deals.filter((item) => item.status === "won");
  const lostDeals = deals.filter((item) => item.status === "lost");
  const openDeals = deals.filter((item) => item.status === "open");
  const completedTasks = tasks.filter((item) => item.status === "completed").length;
  const overdueTasks = overduePriorityRaw.reduce((sum, item) => sum + item.value, 0);
  const wonRevenue = wonDeals.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const winRate = deals.length
    ? Number(((wonDeals.length / deals.length) * 100).toFixed(1))
    : 0;

  const userMap = new Map(users.map((user) => [String(user._id), user]));
  const performanceMap = new Map();

  const ensureMember = (userId) => {
    const key = String(userId || "unassigned");

    if (!performanceMap.has(key)) {
      const member = userMap.get(key);
      performanceMap.set(key, {
        id: key,
        name: member?.name || "Unassigned",
        role: member?.role || "n/a",
        contacts: 0,
        deals: 0,
        revenue: 0,
        tasksCompleted: 0,
      });
    }

    return performanceMap.get(key);
  };

  contacts.forEach((contact) => {
    ensureMember(contact.assignedTo).contacts += 1;
  });

  deals.forEach((deal) => {
    const member = ensureMember(deal.assignedTo);
    member.deals += 1;

    if (deal.status === "won") {
      member.revenue += Number(deal.value || 0);
    }
  });

  tasks.forEach((task) => {
    if (task.status === "completed") {
      ensureMember(task.assignedTo).tasksCompleted += 1;
    }
  });

  const monthLabel = (year, month) =>
    new Date(year, month - 1, 1).toLocaleString("en-US", { month: "short" });

  return {
    filters: {
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
    },
    summary: {
      leadsCreated,
      qualifiedLeads,
      wonDeals: wonDeals.length,
      lostDeals: lostDeals.length,
      openDeals: openDeals.length,
      wonRevenue,
      winRate,
      completedTasks,
      overdueTasks,
    },
    charts: {
      leadSources: leadSourceRaw.map((item) => ({
        name: item._id || "unknown",
        value: item.value,
      })),
      funnel: funnelRaw.map((item) => ({
        name: item._id || "unknown",
        value: item.value,
      })),
      outcomes: outcomeRaw.map((item) => ({
        name: item._id || "unknown",
        value: item.value,
      })),
      revenueTrend: revenueTrendRaw.map((item) => ({
        month: monthLabel(item._id.year, item._id.month),
        revenue: item.revenue,
      })),
      overdueByPriority: overduePriorityRaw.map((item) => ({
        name: item._id || "unknown",
        value: item.value,
      })),
    },
    teamPerformance: [...performanceMap.values()]
      .sort((left, right) => right.revenue - left.revenue || right.deals - left.deals)
      .slice(0, 8),
  };
};

const listAdvancedReporting = async (request, response) => {
    const data = await buildAdvancedReportingData(request.user._id, request.orgId, {
      start: request.query.start,
      end: request.query.end,
  });

  response.status(200).json({
    success: true,
    message: "Advanced reporting fetched successfully",
    data,
  });
};

module.exports = {
  buildAdvancedReportingData,
  generateDashboardBrief,
  listAdvancedReporting,
  listDashboardAnalytics,
};
