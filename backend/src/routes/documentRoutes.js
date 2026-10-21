const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const {
  listDocuments,
  createDocument,
  deleteDocument,
} = require("../controllers/documentController");

const router = express.Router();

router.use(protect);

router.route("/").get(listDocuments).post(createDocument);
router.route("/:documentId").delete(deleteDocument);

module.exports = router;
