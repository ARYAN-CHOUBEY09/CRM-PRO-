const mongoose = require("mongoose");

const DEMO_EMAIL = "admin@crm.com";
const DEMO_PASSWORD = "Admin@123";
const DEMO_ORG_ID = "default-org";
const DEMO_ORG_NAME = "Orbit Default Workspace";
const DEMO_USER_ID = "507f1f77bcf86cd799439011";

const normalizeEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const isDatabaseConnected = () => mongoose.connection.readyState === 1;

const buildDemoSafeUser = () => ({
  _id: DEMO_USER_ID,
  id: DEMO_USER_ID,
  name: "Admin",
  email: DEMO_EMAIL,
  role: "admin",
  isActive: true,
  lastLoginAt: new Date().toISOString(),
  createdAt: null,
  updatedAt: null,
  orgId: DEMO_ORG_ID,
  orgName: DEMO_ORG_NAME,
  organizations: [
    {
      id: DEMO_ORG_ID,
      name: DEMO_ORG_NAME,
      role: "admin",
    },
  ],
});

const buildDemoAuthUser = () => ({
  _id: DEMO_USER_ID,
  id: DEMO_USER_ID,
  name: "Admin",
  email: DEMO_EMAIL,
  role: "admin",
  isActive: true,
  orgId: DEMO_ORG_ID,
  orgName: DEMO_ORG_NAME,
  toSafeObject: buildDemoSafeUser,
});

const isDemoCredentials = (email, password) =>
  normalizeEmail(email) === DEMO_EMAIL && String(password || "") === DEMO_PASSWORD;

const isDemoTokenPayload = (payload) =>
  Boolean(
    payload &&
      (payload.isDemo === true ||
        payload.userId === DEMO_USER_ID ||
        payload.userId === "demo-admin" ||
        normalizeEmail(payload.email) === DEMO_EMAIL),
  );

module.exports = {
  buildDemoAuthUser,
  buildDemoSafeUser,
  isDatabaseConnected,
  isDemoCredentials,
  isDemoTokenPayload,
};
