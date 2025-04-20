// backend/routes/chatRoutes.js
const express = require("express");
const chatController = require("../controllers/chatController");

const router = express.Router();

// Define route for chat API
router.post("/", chatController.chat);

module.exports = router;
