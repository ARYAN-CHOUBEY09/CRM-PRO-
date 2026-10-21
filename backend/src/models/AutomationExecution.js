const mongoose = require("mongoose");

const automationExecutionSchema = new mongoose.Schema(
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
    rule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AutomationRule",
      required: true,
    },
    entityType: {
      type: String,
      enum: ["contact", "task", "system"],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    status: {
      type: String,
      enum: ["success", "failed", "skipped"],
      default: "success",
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
    executionKey: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

automationExecutionSchema.index({ owner: 1, createdAt: -1 });
automationExecutionSchema.index({ rule: 1, executionKey: 1 }, { unique: true, sparse: true });

automationExecutionSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    owner: this.owner,
    rule: this.rule,
    entityType: this.entityType,
    entityId: this.entityId,
    status: this.status,
    message: this.message,
    metadata: this.metadata,
    executionKey: this.executionKey,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("AutomationExecution", automationExecutionSchema);
