// Chatbot.jsx
import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { sendToGemini } from "@/services/aiService"; // Make sure you implement this

export default function Chatbot() {
  const [chat, setChat] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", text: input };
    setChat((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendToGemini(input); // returns text
      const botMsg = { role: "bot", text: response };
      setChat((prev) => [...prev, botMsg]);
    } catch (err) {
      const errorMsg = { role: "bot", text: "⚠️ Error getting response. Try again." };
      setChat((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const clearChat = () => setChat([]);

  return (
    <Card className="max-w-3xl mx-auto p-6 mt-6 bg-white border border-gray-200 rounded-2xl shadow-xl h-[75vh] flex flex-col">
      <CardContent className="flex-1 overflow-y-auto space-y-4 pr-2">
        {chat.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm shadow ${
              msg.role === "user"
                ? "bg-purple-100 self-end text-right rounded-br-none"
                : "bg-gray-100 self-start rounded-bl-none"
            }`}
          >
            {msg.text}
          </motion.div>
        ))}

        {loading && (
          <div className="self-start flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 rounded-full bg-gray-400 animate-ping" />
            Gemini is typing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </CardContent>

      <div className="mt-4 flex items-center gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask something..."
          className="flex-1 border-gray-300"
        />
        <Button
          onClick={handleSend}
          className="bg-purple-600 hover:bg-purple-700 transition"
          disabled={loading}
        >
          Send
        </Button>
        <Button variant="outline" onClick={clearChat} className="border-gray-300">
          Clear
        </Button>
      </div>
    </Card>
  );
}
