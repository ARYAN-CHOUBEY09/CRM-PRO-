const express = require("express");

const aiRoutes = require("./aiRoutes");
const activityRoutes = require("./activityRoutes");
const analyticsRoutes = require("./analyticsRoutes");
const automationRoutes = require("./automationRoutes");
const authRoutes = require("./authRoutes");
const contactRoutes = require("./contactRoutes");
const emailRoutes = require("./emailRoutes");
const notificationRoutes = require("./notificationRoutes");
const pipelineRoutes = require("./pipelineRoutes");
const systemRoutes = require("./systemRoutes");
const taskRoutes = require("./taskRoutes");
const timelineRoutes = require("./timelineRoutes");
const userRoutes = require("./userRoutes");
const searchRoutes = require("./searchRoutes");
const documentRoutes = require("./documentRoutes");

const router = express.Router();

router.use("/ai", aiRoutes);
router.use("/activities", activityRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/automations", automationRoutes);
router.use("/auth", authRoutes);
router.use("/contacts", contactRoutes);
router.use("/emails", emailRoutes);
router.use("/notifications", notificationRoutes);
router.use("/pipeline", pipelineRoutes);
router.use("/documents", documentRoutes);
router.use("/system", systemRoutes);
router.use("/tasks", taskRoutes);
router.use("/timeline", timelineRoutes);
router.use("/users", userRoutes);
router.use("/search", searchRoutes);

module.exports = router;
