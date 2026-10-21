const express = require("express");

const {
  generateDashboardBrief,
  listAdvancedReporting,
  listDashboardAnalytics,
} = require("../controllers/analyticsController");
const { protect } = require("../middleware/authMiddleware");
const { authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/dashboard", listDashboardAnalytics);
router.post("/dashboard/ai-brief", generateDashboardBrief);
router.get("/reports", authorize("admin", "manager"), listAdvancedReporting);

module.exports = router;
