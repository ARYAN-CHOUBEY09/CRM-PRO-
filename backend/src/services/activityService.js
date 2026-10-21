const Activity = require("../models/Activity");

const logActivity = async ({
  owner,
  actor,
  entityType,
  entityId = null,
  action,
  message,
  metadata = {},
}) => {
  return Activity.create({
    owner,
    actor,
    entityType,
    entityId,
    action,
    message,
    metadata,
  });
};

module.exports = {
  logActivity,
};

