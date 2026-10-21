const express = require("express");

const { listActivities } = require("../controllers/activityController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", listActivities);

module.exports = router;

