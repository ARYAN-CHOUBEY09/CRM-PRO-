const express = require("express");

const {
  createUser,
  listUsers,
  updateUserAccess,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/", authorize("admin", "manager", "sales"), listUsers);
router.post("/", authorize("admin"), createUser);
router.put("/:userId", authorize("admin"), updateUserAccess);

module.exports = router;
