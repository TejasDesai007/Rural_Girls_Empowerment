import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendToGemini } from "../services/aiService";
import { LoaderCircle } from "lucide-react";

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (promptOverride) => {
    const newPrompt = promptOverride || input.trim(); // Fix prompt handling
    if (!newPrompt) return;

    setInput("");
    setLoading(true);

    const userMsg = { role: "user", content: newPrompt };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const aiReply = await sendToGemini(newPrompt);
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: aiReply },
      ]);
    } catch (err) {
      console.error("ChatAssistant handleSend error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: err.message || "❌ Failed to fetch response. Try again later.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => {
    if (!loading) {
      handleSend(promptText);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">
        💬 Your Digital Assistant
      </h2>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {[
          "Suggest a business idea",
          "Translate this word to Hindi",
          "Summarize this text",
          "What is menstrual hygiene?",
          "How to register a small business?",
        ].map((prompt, idx) => (
          <Button
            key={idx}
            variant="outline"
            size="sm"
            onClick={() => handleQuickPrompt(prompt)}
            disabled={loading}
          >
            {prompt}
          </Button>
        ))}
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-inner p-4 overflow-y-auto border border-gray-200 mb-4 min-h-[40vh] flex flex-col">
        {messages.length === 0 && !loading ? (
          <p className="text-gray-400 text-center my-auto">
            Start a conversation by typing or selecting a quick prompt.
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 max-w-3xl w-fit ${
                msg.role === "user" ? "ml-auto" : "mr-auto"
              }`}
            >
              <div
                className={`inline-block rounded-lg px-4 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-blue-100 text-blue-800 rounded-br-none"
                    : msg.content.startsWith("❌")
                    ? "bg-red-100 text-red-700 rounded-bl-none"
                    : "bg-gray-100 text-gray-700 rounded-bl-none"
                }`}
              >
                {msg.content.split("\n").map((line, i) => (
                  <span key={i}>
                    {line}
                    <br />
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-start items-center mt-2 text-gray-500">
            <LoaderCircle className="animate-spin w-4 h-4 mr-2" />
            <span>Thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask anything..."
          className="w-full min-h-[3rem] md:min-h-[2.5rem] resize-none"
          rows={1}
          disabled={loading}
        />
        <div className="flex gap-2 w-full sm:w-auto">
          <Button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="flex-grow sm:flex-grow-0"
          >
            {loading ? (
              <LoaderCircle className="animate-spin w-4 h-4" />
            ) : (
              "Send"
            )}
          </Button>
          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={loading}
            className="flex-grow sm:flex-grow-0"
          >
            Clear Chat
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;
