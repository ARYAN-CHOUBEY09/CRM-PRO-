const express = require("express");

const {
  createContact,
  deleteContact,
  generateContactAiSummary,
  getContactById,
  listContacts,
  updateContact,
  rescoreContact,
} = require("../controllers/contactController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);

router.route("/").get(listContacts).post(createContact);
router.post("/:contactId/ai-summary", generateContactAiSummary);
router.post("/:contactId/score", rescoreContact);
router
  .route("/:contactId")
  .get(getContactById)
  .put(updateContact)
  .delete(deleteContact);

module.exports = router;
