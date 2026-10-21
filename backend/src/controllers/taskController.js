const Contact = require("../models/Contact");
const Deal = require("../models/Deal");
const Task = require("../models/Task");
const User = require("../models/User");
const { logActivity } = require("../services/activityService");
const { createNotification } = require("../services/notificationService");
const {
  canAssignToUser,
  getOwnedOrAssignedScope,
  getOwnedScope,
} = require("../utils/permissionScopes");
const formatMongooseError = require("../utils/catchValidationError");

const mapUserReference = (user) => {
  if (!user) {
    return null;
  }

  if (typeof user.toSafeObject === "function") {
    return user.toSafeObject();
  }

  return {
    id: user._id || user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
  };
};

const mapContactReference = (contact) => {
  if (!contact) {
    return null;
  }

  return {
    id: contact._id || contact.id,
    firstName: contact.firstName,
    lastName: contact.lastName,
    fullName:
      contact.fullName ||
      `${contact.firstName || ""} ${contact.lastName || ""}`.trim(),
    company: contact.company,
  };
};

const mapDealReference = (deal) => {
  if (!deal) {
    return null;
  }

  return {
    id: deal._id || deal.id,
    title: deal.title,
    value: deal.value,
    currency: deal.currency,
  };
};

const updateTaskDerivedStatus = (task) => {
  if (task.status === "completed") {
    return {
      ...task,
      completedAt: task.completedAt || task.updatedAt,
    };
  }

  if (task.dueDate && new Date(task.dueDate) < new Date()) {
    return {
      ...task,
      status: "overdue",
    };
  }

  return task;
};

const sanitizeTask = (task) =>
  updateTaskDerivedStatus({
    ...task.toSafeObject(),
    assignedTo: mapUserReference(task.assignedTo),
    createdBy: mapUserReference(task.createdBy),
    contact: mapContactReference(task.contact),
    deal: mapDealReference(task.deal),
  });

const getLinkedEntityScope = (user) =>
  getOwnedOrAssignedScope(user, {
    ownerField: "owner",
    assigneeField: "assignedTo",
  });

const listTasks = async (request, response) => {
  const { status, priority, assignedTo, q, page = 1, limit = 10 } = request.query;

  const conditions = [{ orgId: request.orgId }];
  const scope = getOwnedOrAssignedScope(request.user);

  if (Object.keys(scope).length > 0) {
    conditions.push(scope);
  }

  if (status) {
    conditions.push({ status });
  }

  if (priority) {
    conditions.push({ priority });
  }

  if (assignedTo) {
    conditions.push({ assignedTo });
  }

  if (q) {
    conditions.push({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
      ],
    });
  }

  const query =
    conditions.length === 0
      ? {}
      : conditions.length === 1
        ? conditions[0]
        : { $and: conditions };

  const pageNumber = Math.max(Number(page) || 1, 1);
  const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 100);

  const [tasks, total] = await Promise.all([
    Task.find(query)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("contact", "firstName lastName company")
      .populate("deal", "title value currency")
      .sort({ dueDate: 1, createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber),
    Task.countDocuments(query),
  ]);

  response.status(200).json({
    success: true,
    message: "Tasks fetched successfully",
    data: {
      tasks: tasks.map(sanitizeTask),
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        pages: Math.ceil(total / limitNumber) || 1,
      },
    },
  });
};

const createTask = async (request, response) => {
  try {
    const ownerId = request.user._id;
    const {
      title,
      description,
      status,
      priority,
      dueDate,
      reminderAt,
      assignedTo,
      contact,
      deal,
    } = request.body;

    const assignee = await User.findOne({
      _id: assignedTo,
      isActive: true,
      orgId: request.orgId,
    });

    if (!assignee) {
      response.status(400);
      throw new Error("Valid assigned user is required");
    }

    if (!canAssignToUser(request.user, assignedTo)) {
      response.status(403);
      throw new Error("Sales users can only assign tasks to themselves");
    }

    if (contact) {
      const contactDoc = await Contact.findOne({
        _id: contact,
        orgId: request.orgId,
        ...getLinkedEntityScope(request.user),
      });

      if (!contactDoc) {
        response.status(400);
        throw new Error("Valid linked contact is required");
      }
    }

    if (deal) {
      const dealDoc = await Deal.findOne({
        _id: deal,
        orgId: request.orgId,
        ...getLinkedEntityScope(request.user),
      });

      if (!dealDoc) {
        response.status(400);
        throw new Error("Valid linked deal is required");
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      reminderAt: reminderAt || null,
      assignedTo,
      contact: contact || null,
      deal: deal || null,
      owner: ownerId,
      createdBy: ownerId,
      orgId: request.orgId,
      completedAt: status === "completed" ? new Date() : null,
    });

    await logActivity({
      owner: ownerId,
      actor: ownerId,
      entityType: "task",
      entityId: task._id,
      action: "task_created",
      message: `Task "${task.title}" created and assigned`,
      metadata: {
        assignedTo,
        priority: task.priority,
        dueDate: task.dueDate,
      },
    });

    await createNotification({
      owner: ownerId,
      recipient: assignedTo,
      actor: ownerId,
      type: "task_assigned",
      title: "New task assigned",
      message: `You have been assigned the task "${task.title}".`,
      entityType: "task",
      entityId: task._id,
      metadata: {
        priority: task.priority,
        dueDate: task.dueDate,
      },
      dedupeKey: `task-assigned:${task._id}:${assignedTo}`,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("contact", "firstName lastName company")
      .populate("deal", "title value currency");

    response.status(201).json({
      success: true,
      message: "Task created successfully",
      data: {
        task: sanitizeTask(populatedTask),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const updateTask = async (request, response) => {
  try {
    const ownerId = request.user._id;
    const payload = { ...request.body };

    if (payload.assignedTo) {
      const assignee = await User.findOne({
        _id: payload.assignedTo,
        isActive: true,
        orgId: request.orgId,
      });

      if (!assignee) {
        response.status(400);
        throw new Error("Valid assigned user is required");
      }

      if (!canAssignToUser(request.user, payload.assignedTo)) {
        response.status(403);
        throw new Error("Sales users can only assign tasks to themselves");
      }
    }

    if (payload.contact) {
      const contact = await Contact.findOne({
        _id: payload.contact,
        orgId: request.orgId,
        ...getLinkedEntityScope(request.user),
      });

      if (!contact) {
        response.status(400);
        throw new Error("Valid linked contact is required");
      }
    }

    if (payload.deal) {
      const deal = await Deal.findOne({
        _id: payload.deal,
        orgId: request.orgId,
        ...getLinkedEntityScope(request.user),
      });

      if (!deal) {
        response.status(400);
        throw new Error("Valid linked deal is required");
      }
    }

    if (payload.status === "completed") {
      payload.completedAt = new Date();
    } else if (payload.status && payload.status !== "completed") {
      payload.completedAt = null;
    }

    const existingTask = await Task.findOne({
      _id: request.params.taskId,
      orgId: request.orgId,
      ...getOwnedOrAssignedScope(request.user),
    }).select("assignedTo title");

    if (!existingTask) {
      response.status(404);
      throw new Error("Task not found");
    }

    const task = await Task.findOneAndUpdate(
      {
        _id: request.params.taskId,
        orgId: request.orgId,
        ...getOwnedOrAssignedScope(request.user),
      },
      payload,
      {
        new: true,
        runValidators: true,
      },
    )
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("contact", "firstName lastName company")
      .populate("deal", "title value currency");

    if (!task) {
      response.status(404);
      throw new Error("Task not found");
    }

    await logActivity({
      owner: ownerId,
      actor: ownerId,
      entityType: "task",
      entityId: task._id,
      action: "task_updated",
      message: `Task "${task.title}" updated`,
      metadata: {
        status: task.status,
        priority: task.priority,
      },
    });

    const nextAssignedId = String(task.assignedTo?._id || task.assignedTo || "");
    const previousAssignedId = String(existingTask.assignedTo || "");

    if (payload.assignedTo && nextAssignedId && nextAssignedId !== previousAssignedId) {
      await createNotification({
        owner: ownerId,
        recipient: nextAssignedId,
        actor: ownerId,
        type: "task_assigned",
        title: "Task assigned to you",
        message: `You have been assigned the task "${task.title}".`,
        entityType: "task",
        entityId: task._id,
        metadata: {
          priority: task.priority,
          dueDate: task.dueDate,
        },
        dedupeKey: `task-reassigned:${task._id}:${nextAssignedId}:${task.updatedAt.toISOString()}`,
      });
    } else if (payload.status || payload.priority || payload.dueDate || payload.reminderAt) {
      await createNotification({
        owner: ownerId,
        recipient: nextAssignedId,
        actor: ownerId,
        type: "task_updated",
        title: "Task updated",
        message: `Task "${task.title}" was updated.`,
        entityType: "task",
        entityId: task._id,
        metadata: {
          status: task.status,
          priority: task.priority,
          dueDate: task.dueDate,
        },
        dedupeKey: "",
      });
    }

    response.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: {
        task: sanitizeTask(task),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const deleteTask = async (request, response) => {
  const task = await Task.findOneAndDelete({
    _id: request.params.taskId,
    orgId: request.orgId,
    ...getOwnedScope(request.user),
  });

  if (!task) {
    response.status(404);
    throw new Error("Task not found");
  }

  await logActivity({
    owner: request.user._id,
    actor: request.user._id,
    entityType: "task",
    entityId: task._id,
    action: "task_deleted",
    message: `Task "${task.title}" deleted`,
  });

  response.status(200).json({
    success: true,
    message: "Task deleted successfully",
  });
};

module.exports = {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
};
