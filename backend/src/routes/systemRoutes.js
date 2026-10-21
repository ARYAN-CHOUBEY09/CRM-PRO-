const express = require("express");

const { getHealthStatus } = require("../controllers/systemController");

const router = express.Router();

router.get("/health", getHealthStatus);

module.exports = router;

