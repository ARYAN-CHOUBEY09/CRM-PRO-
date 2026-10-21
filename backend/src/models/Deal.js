const mongoose = require("mongoose");

const dealSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      default: "default-org",
      index: true,
    },
    title: {
      type: String,
      required: [true, "Deal title is required"],
      trim: true,
      maxlength: [140, "Deal title cannot exceed 140 characters"],
    },
    value: {
      type: Number,
      required: [true, "Deal value is required"],
      min: [0, "Deal value cannot be negative"],
    },
    currency: {
      type: String,
      trim: true,
      uppercase: true,
      default: "USD",
    },
    status: {
      type: String,
      enum: ["open", "won", "lost"],
      default: "open",
    },
    expectedCloseDate: {
      type: Date,
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      required: [true, "Linked contact is required"],
    },
    stage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PipelineStage",
      required: [true, "Stage is required"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

dealSchema.index({ owner: 1, stage: 1 });

dealSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    title: this.title,
    value: this.value,
    currency: this.currency,
    status: this.status,
    expectedCloseDate: this.expectedCloseDate,
    notes: this.notes,
    contact: this.contact,
    stage: this.stage,
    owner: this.owner,
    assignedTo: this.assignedTo,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Deal", dealSchema);
