const mongoose = require("mongoose");

const pipelineStageSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      required: true,
      default: "default-org",
      index: true,
    },
    name: {
      type: String,
      required: [true, "Stage name is required"],
      trim: true,
      maxlength: [80, "Stage name cannot exceed 80 characters"],
    },
    color: {
      type: String,
      trim: true,
      default: "#2563eb",
    },
    order: {
      type: Number,
      required: true,
      min: 0,
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

// Legacy unique indexes (owner+order) cause conflicts after org support.
// New unique index includes orgId; drop old one manually if present.
pipelineStageSchema.index(
  { owner: 1, orgId: 1, order: 1 },
  { unique: true, name: "owner_org_order_unique" },
);
pipelineStageSchema.index(
  { owner: 1, orgId: 1, name: 1 },
  { unique: true, name: "owner_org_name_unique" },
);

pipelineStageSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    color: this.color,
    order: this.order,
    isDefault: this.isDefault,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model("PipelineStage", pipelineStageSchema);
