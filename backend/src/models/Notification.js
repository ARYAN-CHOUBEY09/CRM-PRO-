const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      default: "default-org",
      index: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      enum: [
        "task_assigned",
        "task_updated",
        "task_reminder",
        "task_overdue",
        "lead_assigned",
        "automation",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [320, "Message cannot exceed 320 characters"],
    },
    entityType: {
      type: String,
      enum: ["contact", "deal", "task", "automation", "system"],
      default: "system",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    dedupeKey: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index(
  { recipient: 1, dedupeKey: 1 },
  {
    unique: true,
    partialFilterExpression: {
      dedupeKey: { $type: "string", $ne: "" },
    },
  },
);

notificationSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    owner: this.owner,
    recipient: this.recipient,
    actor: this.actor,
    type: this.type,
    title: this.title,
    message: this.message,
    entityType: this.entityType,
    entityId: this.entityId,
    metadata: this.metadata,
    isRead: this.isRead,
    readAt: this.readAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Notification", notificationSchema);
