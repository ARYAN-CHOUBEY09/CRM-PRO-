const User = require("../models/User");
const formatMongooseError = require("../utils/catchValidationError");
const { isPrivilegedRole } = require("../utils/permissionScopes");

const listUsers = async (request, response) => {
  const baseScope = { orgId: request.orgId };
  const query = isPrivilegedRole(request.user)
    ? baseScope
    : { ...baseScope, _id: request.user._id };

  const users = await User.find(query)
    .select("name email role isActive createdAt updatedAt lastLoginAt")
    .sort({ name: 1 });

  response.status(200).json({
    success: true,
    message: "Users fetched successfully",
    data: {
      users: users.map((user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      })),
    },
  });
};

const createUser = async (request, response) => {
  try {
    const normalizedName = String(request.body.name || "").trim();
    const normalizedEmail = String(request.body.email || "")
      .trim()
      .toLowerCase();
    const password = String(request.body.password || "");
    const role = request.body.role || "sales";

    if (!normalizedName || !normalizedEmail || !password) {
      response.status(400);
      throw new Error("Name, email, and password are required");
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
      orgId: request.orgId,
    });

    if (existingUser) {
      response.status(409);
      throw new Error("A user with this email already exists");
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role,
      orgId: request.orgId,
      orgName: request.user.orgName || "Orbit Default Workspace",
    });

    response.status(201).json({
      success: true,
      message: "User created successfully",
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

const updateUserAccess = async (request, response) => {
  try {
    const { role, isActive, password } = request.body;
    const user = await User.findOne({
      _id: request.params.userId,
      orgId: request.orgId,
    }).select("+password");

    if (!user) {
      response.status(404);
      throw new Error("User not found");
    }

    if (String(user._id) === String(request.user._id) && isActive === false) {
      response.status(400);
      throw new Error("Admin cannot deactivate their own account");
    }

    if (role) {
      user.role = role;
    }

    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    }

    if (password) {
      user.password = String(password);
    }

    await user.save();

    response.status(200).json({
      success: true,
      message: "User access updated successfully",
      data: {
        user: user.toSafeObject(),
      },
    });
  } catch (error) {
    response.status(response.statusCode === 200 ? 400 : response.statusCode);
    throw new Error(formatMongooseError(error));
  }
};

module.exports = {
  createUser,
  listUsers,
  updateUserAccess,
};
