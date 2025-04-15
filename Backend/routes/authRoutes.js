const express = require("express");
const { handleGoogleAuth } = require("../controllers/authController");

const router = express.Router();

// POST /api/auth/google
router.post("/google", handleGoogleAuth);

module.exports = router;
