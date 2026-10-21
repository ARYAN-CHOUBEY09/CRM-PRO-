const express = require("express");

const { listGlobalSearchResults } = require("../controllers/searchController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(protect);
router.get("/", listGlobalSearchResults);

module.exports = router;
