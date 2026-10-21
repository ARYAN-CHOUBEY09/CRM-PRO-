const Notification = require("../models/Notification");
const Task = require("../models/Task");

const createNotification = async ({
  owner,
  recipient,
  actor = null,
  type,
  title,
  message,
  orgId = "default-org",
  entityType = "system",
  entityId = null,
  metadata = {},
  dedupeKey = "",
}) => {
  if (!recipient) {
    return null;
  }

  if (dedupeKey) {
    const existing = await Notification.findOne({
      recipient,
      orgId,
      dedupeKey,
    });

    if (existing) {
      return existing;
    }
  }

  return Notification.create({
    owner,
    recipient,
    actor,
    type,
    title,
    message,
    orgId,
    entityType,
    entityId,
    metadata,
    dedupeKey,
  });
};

const syncTaskNotificationsForUser = async (userId, orgId = "default-org") => {
  const now = new Date();
  const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const tasks = await Task.find({
    assignedTo: userId,
    orgId,
    status: { $ne: "completed" },
    $or: [
      { reminderAt: { $lte: now } },
      { dueDate: { $lte: now } },
      {
        dueDate: {
          $gt: now,
          $lte: nextDay,
        },
      },
    ],
  }).select("title dueDate reminderAt owner assignedTo");

  for (const task of tasks) {
    if (task.reminderAt && task.reminderAt <= now) {
      await createNotification({
        owner: task.owner,
        recipient: task.assignedTo,
        type: "task_reminder",
        title: "Task reminder",
        message: `Reminder scheduled for task "${task.title}".`,
        orgId,
        entityType: "task",
        entityId: task._id,
        metadata: {
          dueDate: task.dueDate,
          reminderAt: task.reminderAt,
        },
        dedupeKey: `task-reminder:${task._id}:${new Date(task.reminderAt).toISOString()}`,
      });
    }

    if (task.dueDate && task.dueDate <= now) {
      await createNotification({
        owner: task.owner,
        recipient: task.assignedTo,
        type: "task_overdue",
        title: "Task overdue",
        message: `Task "${task.title}" is overdue and needs attention.`,
        orgId,
        entityType: "task",
        entityId: task._id,
        metadata: {
          dueDate: task.dueDate,
        },
        dedupeKey: `task-overdue:${task._id}`,
      });
      continue;
    }

    if (task.dueDate && task.dueDate > now && task.dueDate <= nextDay) {
      await createNotification({
        owner: task.owner,
        recipient: task.assignedTo,
        type: "task_reminder",
        title: "Task due soon",
        message: `Task "${task.title}" is due within the next 24 hours.`,
        orgId,
        entityType: "task",
        entityId: task._id,
        metadata: {
          dueDate: task.dueDate,
        },
        dedupeKey: `task-due-soon:${task._id}:${new Date(task.dueDate).toISOString().slice(0, 10)}`,
      });
    }
  }
};

module.exports = {
  createNotification,
  syncTaskNotificationsForUser,
};
