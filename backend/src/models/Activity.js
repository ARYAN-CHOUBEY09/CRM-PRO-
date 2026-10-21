const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema(
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
    actor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    entityType: {
      type: String,
      enum: ["contact", "deal", "task", "auth", "system"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    action: {
      type: String,
      required: true,
      trim: true,
      maxlength: [80, "Action cannot exceed 80 characters"],
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: [280, "Message cannot exceed 280 characters"],
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  },
);

activitySchema.index({ owner: 1, createdAt: -1 });

activitySchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    owner: this.owner,
    actor: this.actor,
    entityType: this.entityType,
    entityId: this.entityId,
    action: this.action,
    message: this.message,
    metadata: this.metadata,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Activity", activitySchema);
