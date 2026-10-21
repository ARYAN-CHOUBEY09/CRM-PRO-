const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const formatMongooseError = require("../utils/catchValidationError");
const {
  buildDemoAuthUser,
  isDatabaseConnected,
  isDemoCredentials,
} = require("../utils/demoMode");

const buildAuthResponse = (user) => ({
  success: true,
  message: "Authentication successful",
  data: {
    token: generateToken({
      userId: user._id || user.id,
      role: user.role,
      orgId: user.orgId || user.organizations?.[0]?.id || "default-org",
      email: user.email || user.toSafeObject?.().email,
      isDemo: !isDatabaseConnected(),
    }),
    user:
      typeof user.toSafeObject === "function"
        ? user.toSafeObject()
        : user,
  },
});

const register = async (request, response) => {
  try {
    const { name, email, password, role, orgId, orgName } = request.body;
    const normalizedName = String(name || "").trim();
    const normalizedEmail = String(email || "")
      .trim()
      .toLowerCase();

    if (!normalizedName || !normalizedEmail || !password) {
      response.status(400);
      throw new Error("Name, email, and password are required");
    }

    // Allow registration in development mode
    if (process.env.NODE_ENV === "production") {
      const existingUsers = await User.countDocuments();
      if (existingUsers > 0) {
        response.status(403);
        throw new Error("Self registration is disabled. Please contact your admin");
      }
    }

    const normalizedRole = role || "admin";

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      response.status(409);
      throw new Error("A user with this email already exists");
    }

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: normalizedRole,
      orgId: orgId || "default-org",
      orgName: orgName || "Orbit Default Workspace",
    });

    response.status(201).json({
      ...buildAuthResponse(user),
      message: "User registered successfully",
    });
  } catch (error) {
    const statusCode = response.statusCode === 200 ? 400 : response.statusCode;
    response.status(statusCode).json({
      success: false,
      message: formatMongooseError(error),
    });
  }
};

const login = async (request, response) => {
  const { email, password } = request.body;
  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  if (!normalizedEmail || !password) {
    response.status(400);
    throw new Error("Email and password are required");
  }

  if (!isDatabaseConnected()) {
    if (!isDemoCredentials(normalizedEmail, password)) {
      response.status(401);
      throw new Error("Invalid email or password");
    }

    const demoUser = buildDemoAuthUser();

    response.status(200).json({
      ...buildAuthResponse(demoUser),
      message: "Login successful",
    });
    return;
  }

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user || !(await user.comparePassword(password))) {
    response.status(401);
    throw new Error("Invalid email or password");
  }

  if (!user.isActive) {
    response.status(403);
    throw new Error("Your account is inactive. Please contact admin");
  }

  user.lastLoginAt = new Date();
  await user.save();

  response.status(200).json({
    ...buildAuthResponse(user),
    message: "Login successful",
  });
};

const getCurrentUser = async (request, response) => {
  response.status(200).json({
    success: true,
    message: "Authenticated user fetched successfully",
    data: {
      user:
        typeof request.user.toSafeObject === "function"
          ? request.user.toSafeObject()
          : request.user,
    },
  });
};

module.exports = {
  register,
  login,
  getCurrentUser,
};
