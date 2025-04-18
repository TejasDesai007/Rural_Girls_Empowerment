const geminiService = require("../services/geminiService");

const chat = async (req, res) => {
  const { prompt } = req.body;  // Changed from 'input' to 'prompt'

  if (!prompt) {  // Check for 'prompt' instead of 'input'
    return res.status(400).json({ error: "Prompt is required" });  // Updated error message to reflect 'prompt'
  }

  try {
    const response = await geminiService.generateContent(prompt);  // Pass 'prompt' to Gemini service
    return res.json({ reply: response });  // Return response from Gemini
  } catch (error) {
    console.error("Gemini interaction error:", error.message);  // Added error logging for better debugging
    return res.status(500).json({ error: "Error interacting with Gemini API" });
  }
};

module.exports = { chat };
