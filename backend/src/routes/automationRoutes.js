const express = require("express");

const {
  createAutomationRule,
  deleteAutomationRule,
  listAutomationExecutions,
  listAutomationRules,
  runAutomationRuleNow,
  updateAutomationRule,
} = require("../controllers/automationController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.use(authorize("admin", "manager"));

router.get("/rules", listAutomationRules);
router.post("/rules", createAutomationRule);
router.put("/rules/:ruleId", updateAutomationRule);
router.delete("/rules/:ruleId", deleteAutomationRule);
router.post("/rules/:ruleId/run", runAutomationRuleNow);
router.get("/executions", listAutomationExecutions);

module.exports = router;
