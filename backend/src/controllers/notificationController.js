const Notification = require("../models/Notification");
const { syncTaskNotificationsForUser } = require("../services/notificationService");
const { isDatabaseConnected } = require("../utils/demoMode");

const mapNotification = (notification) => ({
  ...notification.toSafeObject(),
  actor: notification.actor
    ? {
        id: notification.actor._id || notification.actor.id,
        name: notification.actor.name,
        email: notification.actor.email,
        role: notification.actor.role,
      }
    : null,
});

const listNotifications = async (request, response) => {
  if (!isDatabaseConnected()) {
    response.status(200).json({
      success: true,
      message: "Notifications fetched successfully",
      data: {
        notifications: [],
        unreadCount: 0,
        totalCount: 0,
      },
    });
    return;
  }

  await syncTaskNotificationsForUser(request.user._id, request.orgId);

  const status = String((request.query.status || "all")).toLowerCase();
  const limit = Math.min(Math.max(Number(request.query.limit) || 20, 1), 100);
  const query = {
    recipient: request.user._id,
    orgId: request.orgId,
  };

  if (status === "unread") {
    query.isRead = false;
  } else if (status === "read") {
    query.isRead = true;
  }

  const [notifications, unreadCount, totalCount] = await Promise.all([
    Notification.find(query)
      .populate("actor", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit),
    Notification.countDocuments({
      recipient: request.user._id,
      orgId: request.orgId,
      isRead: false,
    }),
    Notification.countDocuments({
      recipient: request.user._id,
      orgId: request.orgId,
    }),
  ]);

  response.status(200).json({
    success: true,
    message: "Notifications fetched successfully",
    data: {
      notifications: notifications.map(mapNotification),
      unreadCount,
      totalCount,
    },
  });
};

const markNotificationAsRead = async (request, response) => {
  if (!isDatabaseConnected()) {
    response.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: {
        notification: null,
      },
    });
    return;
  }

  const notification = await Notification.findOneAndUpdate(
    {
      _id: request.params.notificationId,
      recipient: request.user._id,
      orgId: request.orgId,
    },
    {
      isRead: true,
      readAt: new Date(),
    },
    {
      new: true,
    },
  ).populate("actor", "name email role");

  if (!notification) {
    response.status(404);
    throw new Error("Notification not found");
  }

  response.status(200).json({
    success: true,
    message: "Notification marked as read",
    data: {
      notification: mapNotification(notification),
    },
  });
};

const markAllNotificationsAsRead = async (request, response) => {
  if (!isDatabaseConnected()) {
    response.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: { unreadCount: 0 },
    });
    return;
  }

  await Notification.updateMany(
    {
      recipient: request.user._id,
      orgId: request.orgId,
      isRead: false,
    },
    {
      isRead: true,
      readAt: new Date(),
    },
  );

  const unreadCount = await Notification.countDocuments({
    recipient: request.user._id,
    orgId: request.orgId,
    isRead: false,
  });

  response.status(200).json({
    success: true,
    message: "All notifications marked as read",
    data: { unreadCount },
  });
};

module.exports = {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
};
