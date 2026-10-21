const mongoose = require("mongoose");

const emailTemplateSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      default: "default-org",
      index: true,
    },
    name: {
      type: String,
      required: [true, "Template name is required"],
      trim: true,
      maxlength: [100, "Template name cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      required: [true, "Template slug is required"],
      trim: true,
      lowercase: true,
      maxlength: [100, "Template slug cannot exceed 100 characters"],
    },
    subject: {
      type: String,
      required: [true, "Template subject is required"],
      trim: true,
      maxlength: [200, "Subject cannot exceed 200 characters"],
    },
    body: {
      type: String,
      required: [true, "Template body is required"],
      trim: true,
      maxlength: [6000, "Body cannot exceed 6000 characters"],
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

// Legacy unique index (owner + slug) may conflict after org support.
emailTemplateSchema.index(
  { owner: 1, orgId: 1, slug: 1 },
  { unique: true, name: "owner_org_slug_unique" },
);

emailTemplateSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    slug: this.slug,
    subject: this.subject,
    body: this.body,
    isDefault: this.isDefault,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("EmailTemplate", emailTemplateSchema);
