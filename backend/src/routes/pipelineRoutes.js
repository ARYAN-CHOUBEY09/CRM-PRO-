const express = require("express");

const {
  createDeal,
  createStage,
  deleteDeal,
  deleteStage,
  getPipelineBoard,
  updateDeal,
  updateDealStage,
  updateStage,
} = require("../controllers/pipelineController");
const { protect, authorize } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.get("/board", getPipelineBoard);
router.post("/stages", authorize("admin", "manager"), createStage);
router.put("/stages/:stageId", authorize("admin", "manager"), updateStage);
router.delete("/stages/:stageId", authorize("admin", "manager"), deleteStage);
router.post("/deals", createDeal);
router.put("/deals/:dealId", updateDeal);
router.patch("/deals/:dealId/stage", updateDealStage);
router.delete("/deals/:dealId", deleteDeal);

module.exports = router;
