const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      default: "default-org",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [140, "Task title cannot exceed 140 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["todo", "in_progress", "completed", "overdue"],
      default: "todo",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    dueDate: {
      type: Date,
      default: null,
    },
    reminderAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
    },
    deal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deal",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

taskSchema.index({ owner: 1, assignedTo: 1, status: 1, dueDate: 1 });

taskSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    title: this.title,
    description: this.description,
    status: this.status,
    priority: this.priority,
    dueDate: this.dueDate,
    reminderAt: this.reminderAt,
    completedAt: this.completedAt,
    owner: this.owner,
    assignedTo: this.assignedTo,
    createdBy: this.createdBy,
    contact: this.contact,
    deal: this.deal,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Task", taskSchema);
