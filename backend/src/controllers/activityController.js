const Activity = require("../models/Activity");

const listActivities = async (request, response) => {
  const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 100);

  const activities = await Activity.find({
    owner: request.user._id,
  })
    .populate("actor", "name email role")
    .sort({ createdAt: -1 })
    .limit(limit);

  response.status(200).json({
    success: true,
    message: "Activities fetched successfully",
    data: {
      activities: activities.map((activity) => activity.toSafeObject()),
    },
  });
};

module.exports = {
  listActivities,
};

