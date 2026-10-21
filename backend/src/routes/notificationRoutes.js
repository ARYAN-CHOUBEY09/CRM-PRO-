const express = require("express");

const {
  listNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} = require("../controllers/notificationController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", listNotifications);
router.patch("/read-all", markAllNotificationsAsRead);
router.patch("/:notificationId/read", markNotificationAsRead);

module.exports = router;
