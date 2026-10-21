const express = require("express");

const {
  createTask,
  deleteTask,
  listTasks,
  updateTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(listTasks).post(createTask);
router.route("/:taskId").put(updateTask).delete(deleteTask);

module.exports = router;

