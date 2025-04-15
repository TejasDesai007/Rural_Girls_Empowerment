// src/services/geminiService.js

// Example function to interact with the Gemini API. You may need to adapt this based on how the Gemini API works and how you authenticate.
const askGemini = async (query) => {
    const endpoint = "https://api.example.com/gemini"; // Replace with your Gemini API endpoint
    const apiKey = process.env.GEMINI_API_KEY // Your Gemini API key from environment variables
  
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          query: query,
        }),
      })
  
      if (!response.ok) {
        throw new Error("Failed to fetch response from Gemini")
      }
  
      const data = await response.json()
      return data.answer || "Sorry, I couldn't find an answer to your question."
    } catch (error) {
      console.error("Error with Gemini API:", error)
      throw new Error("There was an error with Gemini. Please try again later.")
    }
  }
  
  export default askGemini
  