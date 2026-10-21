const mongoose = require("mongoose");

const customFieldSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    value: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
  },
  { _id: false },
);

const contactSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      default: "default-org",
      index: true,
    },
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, "Phone cannot exceed 20 characters"],
      default: "",
    },
    company: {
      type: String,
      trim: true,
      maxlength: [120, "Company cannot exceed 120 characters"],
      default: "",
    },
    jobTitle: {
      type: String,
      trim: true,
      maxlength: [120, "Job title cannot exceed 120 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["lead", "qualified", "proposal", "customer", "lost"],
      default: "lead",
    },
    source: {
      type: String,
      trim: true,
      maxlength: [80, "Source cannot exceed 80 characters"],
      default: "manual",
    },
    tags: {
      type: [String],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    scoreBand: {
      type: String,
      enum: ["A", "B", "C", "D"],
      default: "D",
    },
    customFields: {
      type: [customFieldSchema],
      default: [],
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
      default: "",
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

contactSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  company: "text",
});

contactSchema.index({ email: 1, owner: 1, orgId: 1 }, { unique: true });

contactSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: `${this.firstName} ${this.lastName}`.trim(),
    email: this.email,
    phone: this.phone,
    company: this.company,
    jobTitle: this.jobTitle,
    status: this.status,
    source: this.source,
    tags: this.tags,
    customFields: this.customFields,
    notes: this.notes,
    owner: this.owner,
    assignedTo: this.assignedTo,
    score: this.score,
    scoreBand: this.scoreBand,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("Contact", contactSchema);
