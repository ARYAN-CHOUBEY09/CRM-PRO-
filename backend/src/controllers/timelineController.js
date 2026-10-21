const Activity = require("../models/Activity");

const listUnifiedTimeline = async (request, response) => {
  const entityType = String(request.query.entityType || "").trim();
  const entityId = String(request.query.entityId || "").trim();
  const limit = Math.min(Math.max(Number(request.query.limit) || 30, 1), 100);

  const query = {
    owner: request.user._id,
  };

  if (entityType) {
    query.entityType = entityType;
  }

  if (entityId) {
    query.entityId = entityId;
  }

  const activities = await Activity.find(query)
    .populate("actor", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit);

  response.status(200).json({
    success: true,
    message: "Timeline fetched successfully",
    data: {
      timeline: activities.map((activity) => ({
        ...activity.toSafeObject(),
        actor: activity.actor
          ? {
              id: activity.actor._id || activity.actor.id,
              name: activity.actor.name,
              email: activity.actor.email,
              role: activity.actor.role,
            }
          : null,
      })),
    },
  });
};

module.exports = {
  listUnifiedTimeline,
};
