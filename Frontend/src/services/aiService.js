import axios from "axios";

// You can configure this with an env variable if needed
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const sendToGemini = async (prompt) => {
  try {
    const response = await axios.post(`${BACKEND_URL}/api/chat`, {
      prompt: prompt, // Pass 'prompt' instead of 'newPrompt'
    });

    // Assuming backend returns { reply: "..." }
    if (response.data && response.data.reply) {
      return response.data.reply; // Updated field to `reply` from backend
    } else {
      throw new Error("Invalid response from server.");
    }
  } catch (error) {
    console.error("Backend Chat API Error:", error);
    throw new Error("❌ Failed to get a response from the server.");
  }
};
