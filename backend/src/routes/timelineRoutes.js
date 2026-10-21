const express = require("express");

const { listUnifiedTimeline } = require("../controllers/timelineController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", listUnifiedTimeline);

module.exports = router;
