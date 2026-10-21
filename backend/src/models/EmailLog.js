const mongoose = require("mongoose");

const recipientSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contact: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contact",
      default: null,
    },
  },
  { _id: false },
);

const emailLogSchema = new mongoose.Schema(
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
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmailTemplate",
      default: null,
    },
    recipients: {
      type: [recipientSchema],
      default: [],
    },
    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: true,
      trim: true,
      maxlength: [6000, "Body cannot exceed 6000 characters"],
    },
    status: {
      type: String,
      enum: ["queued", "sent", "failed"],
      default: "queued",
    },
    provider: {
      type: String,
      trim: true,
      default: "smtp",
    },
    errorMessage: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

emailLogSchema.index({ owner: 1, createdAt: -1 });

emailLogSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    owner: this.owner,
    sentBy: this.sentBy,
    template: this.template,
    recipients: this.recipients,
    subject: this.subject,
    body: this.body,
    status: this.status,
    provider: this.provider,
    errorMessage: this.errorMessage,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("EmailLog", emailLogSchema);
