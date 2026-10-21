const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      default: "default-org",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 140,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 260,
    },
    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      default: "application/octet-stream",
      trim: true,
    },
    size: {
      type: Number,
      default: 0,
    },
    entityType: {
      type: String,
      enum: ["deal", "task", "contact", "project", "misc"],
      default: "project",
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

documentSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    orgId: this.orgId,
    title: this.title,
    fileName: this.fileName,
    fileUrl: this.fileUrl,
    mimeType: this.mimeType,
    size: this.size,
    entityType: this.entityType,
    entityId: this.entityId,
    assignedTo: this.assignedTo,
    createdBy: this.createdBy,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Document", documentSchema);
