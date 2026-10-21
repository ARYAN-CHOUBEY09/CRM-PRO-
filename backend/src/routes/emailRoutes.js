const express = require("express");

const {
  createTemplate,
  generateAiEmailDraft,
  listEmailLogs,
  listTemplates,
  sendBulkEmail,
  sendSingleEmail,
} = require("../controllers/emailController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/templates", listTemplates);
router.post("/templates", authorize("admin", "manager"), createTemplate);
router.get("/logs", listEmailLogs);
router.post("/ai-draft", generateAiEmailDraft);
router.post("/send", sendSingleEmail);
router.post("/bulk-send", sendBulkEmail);

module.exports = router;
