const fetch = require("node-fetch");
const GEMINI_API_KEY = "AIzaSyDp7-P2v_9vWOX5XS1DZC6_RofD-j_QO9Q";  
const generateContent = async (prompt) => {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";  
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
    throw error;  // Propagate the error to be handled in the controller
  }
};

module.exports = { generateContent };
