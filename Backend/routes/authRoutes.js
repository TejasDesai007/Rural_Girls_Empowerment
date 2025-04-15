const express = require("express");
const { handleGoogleAuth } = require("../controllers/authController");
const {handleRegister} = require("../controllers/userMentorController");

const router = express.Router();

// POST /api/auth/google
router.post("/google", handleGoogleAuth);
router.post("/register", handleRegister); 

module.exports = router;
