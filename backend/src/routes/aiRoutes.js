const express = require("express");

const { chatWithCopilot } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.post("/copilot/chat", chatWithCopilot);

module.exports = router;
