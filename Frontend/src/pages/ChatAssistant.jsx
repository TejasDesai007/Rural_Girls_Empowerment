import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
// import { sendGeminiPrompt } from "../services/aiService";
import { LoaderCircle } from "lucide-react";
import { db } from "../firebase"; // Firestore
import firebase from "firebase/app"; // for timestamp

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = db
      .collection("chatMessages")
      .orderBy("timestamp")
      .onSnapshot((snapshot) => {
        const loadedMessages = snapshot.docs.map((doc) => doc.data());
        setMessages(loadedMessages);
      });

    return () => unsubscribe();
  }, []);

  const saveMessageToDB = async (role, content) => {
    await db.collection("chatMessages").add({
      role,
      content,
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
  };

  const handleSend = async (prompt) => {
    const newPrompt = prompt || input;
    if (!newPrompt.trim()) return;

    const userMsg = { role: "user", content: newPrompt };
    setInput("");
    setLoading(true);

    try {
      await saveMessageToDB("user", newPrompt);
      const aiReply = await sendGeminiPrompt(newPrompt);
      await saveMessageToDB("ai", aiReply);
    } catch (err) {
      await saveMessageToDB("ai", "❌ Failed to fetch response. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (promptText) => handleSend(promptText);

  const handleClear = async () => {
    const snapshot = await db.collection("chatMessages").get();
    const batch = db.batch();
    snapshot.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    setMessages([]);
    setInput("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">
        💬 Your Digital Assistant
      </h2>

      {/* 🔘 PromptSuggestions */}
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
          >
            {prompt}
          </Button>
        ))}
      </div>

      {/* 💬 Chat Window */}
      <div className="flex-1 bg-white rounded-xl shadow-inner p-4 overflow-y-auto border border-gray-200 mb-4">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-center mt-10">
            Start a conversation by typing or selecting a quick prompt.
          </p>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-4 max-w-3xl ${
                msg.role === "user" ? "ml-auto text-right" : "mr-auto text-left"
              }`}
            >
              <div
                className={`inline-block rounded-lg px-4 py-2 ${
                  msg.role === "user"
                    ? "bg-blue-100 text-blue-800"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="flex justify-center mt-2 text-gray-500">
            <LoaderCircle className="animate-spin w-5 h-5" />
          </div>
        )}
      </div>

      {/* 📝 Input + Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          className="w-full min-h-[3rem] md:min-h-[2.5rem]"
        />
        <Button onClick={() => handleSend()} disabled={loading}>
          Send
        </Button>
        <Button variant="ghost" onClick={handleClear}>
          Clear Chat
        </Button>
      </div>
    </div>
  );
};

export default ChatAssistant;
