const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    orgId: {
      type: String,
      default: "default-org",
      index: true,
    },
    orgName: {
      type: String,
      default: "Orbit Default Workspace",
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters long"],
      maxlength: [80, "Name cannot exceed 80 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "manager", "sales"],
      default: "sales",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre("save", async function savePassword(next) {
  if (!this.isModified("password")) {
    next();
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  const passwordCandidates = [candidatePassword];

  if (
    typeof candidatePassword === "string" &&
    candidatePassword.trim() !== candidatePassword
  ) {
    passwordCandidates.push(candidatePassword.trim());
  }

  const isBcryptHash =
    typeof this.password === "string" &&
    /^\$2[aby]\$\d{2}\$/.test(this.password);

  if (isBcryptHash) {
    return passwordCandidates.reduce(async (matchedPromise, currentPassword) => {
      const matched = await matchedPromise;

      if (matched) {
        return true;
      }

      return bcrypt.compare(currentPassword, this.password);
    }, Promise.resolve(false));
  }

  return Promise.resolve(
    passwordCandidates.some((currentPassword) => currentPassword === this.password),
  );
};

userSchema.methods.toSafeObject = function toSafeObject() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    isActive: this.isActive,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    organizations: [
      {
        id: this.orgId || "default-org",
        name: this.orgName || "Orbit Default Workspace",
        role: this.role,
      },
    ],
  };
};

module.exports = mongoose.model("User", userSchema);
