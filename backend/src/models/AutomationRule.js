const mongoose = require("mongoose");

const automationRuleSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      default: "default-org",
      index: true,
    },
    name: {
      type: String,
      required: [true, "Automation name is required"],
      trim: true,
      maxlength: [140, "Automation name cannot exceed 140 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [400, "Description cannot exceed 400 characters"],
      default: "",
    },
    triggerType: {
      type: String,
      enum: [
        "contact_age_days",
        "new_unassigned_lead",
        "overdue_task",
        "lead_created",
        "contact_updated",
      ],
      required: true,
    },
    actionType: {
      type: String,
      enum: ["send_email", "assign_contact", "log_activity", "assign_and_whatsapp"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    config: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    lastRunAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

automationRuleSchema.index({ owner: 1, createdAt: -1 });

automationRuleSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    description: this.description,
    triggerType: this.triggerType,
    actionType: this.actionType,
    isActive: this.isActive,
    config: this.config,
    lastRunAt: this.lastRunAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("AutomationRule", automationRuleSchema);
