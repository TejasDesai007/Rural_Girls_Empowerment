// aiService.js
// Handles interaction with Google Gemini API
// NOTE: You must replace <YOUR_GEMINI_API_KEY> with your actual key
// OR load it from a secure .env file if using Vite (VITE_GEMINI_API_KEY)

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

export const sendToGemini = async (prompt) => {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent";

  const headers = {
    "Content-Type": "application/json",
  };

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
  };

  try {
    const response = await fetch(`${url}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (data && data.candidates && data.candidates.length > 0) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error("No valid response from Gemini.");
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "❌ Failed to get a response from Gemini.";
  }
};
