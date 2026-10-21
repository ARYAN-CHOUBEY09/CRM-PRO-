const jwt = require("jsonwebtoken");

const { env } = require("../config/env");
const User = require("../models/User");
const {
  buildDemoSafeUser,
  isDatabaseConnected,
  isDemoTokenPayload,
} = require("../utils/demoMode");

const protect = async (request, response, next) => {
  const authHeader = request.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    response.status(401);
    return next(new Error("Access denied. Token missing"));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (!isDatabaseConnected()) {
      if (!isDemoTokenPayload(decoded)) {
        response.status(503);
        return next(new Error("Database is unavailable. Please use demo admin login"));
      }

      const demoUser = buildDemoSafeUser();
      request.user = demoUser;
      request.orgId = request.headers["x-org-id"] || demoUser.orgId;

      if (
        request.headers["x-org-id"] &&
        request.headers["x-org-id"] !== demoUser.orgId
      ) {
        response.status(403);
        return next(new Error("You do not belong to this workspace"));
      }

      return next();
    }

    const user = await User.findById(decoded.userId);

    if (!user || !user.isActive) {
      response.status(401);
      return next(new Error("User not found or inactive"));
    }

    request.user = user;
    request.orgId =
      request.headers["x-org-id"] ||
      user.orgId ||
      "default-org";

    if (
      request.headers["x-org-id"] &&
      request.headers["x-org-id"] !== user.orgId
    ) {
      response.status(403);
      return next(new Error("You do not belong to this workspace"));
    }
    next();
  } catch (error) {
    response.status(401);
    next(new Error("Invalid or expired token"));
  }
};

const authorize = (...roles) => (request, response, next) => {
  if (!request.user) {
    response.status(401);
    return next(new Error("Authentication required"));
  }

  if (!roles.includes(request.user.role)) {
    response.status(403);
    return next(new Error("You do not have permission to access this resource"));
  }

  next();
};

module.exports = {
  protect,
  authorize,
};
