import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendToGemini } from "../services/aiService";
import { LoaderCircle, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const LANGUAGE_CONFIG = {
  'hi-IN': { 
    name: 'Hindi',
    responseLang: 'hi',
    errorMessage: 'कृपया पुनः प्रयास करें या अपनी क्वेरी स्पष्ट करें।',
    fallbackResponse: 'क्षमा करें, मुझे यह जानकारी उपलब्ध नहीं है।'
  },
  'mr-IN': { 
    name: 'Marathi',
    responseLang: 'mr',
    errorMessage: 'कृपया पुन्हा प्रयत्न करा किंवा तुमची क्वेरी स्पष्ट करा.',
    fallbackResponse: 'माफ करा, ही माहिती माझ्याकडे उपलब्ध नाही.'
  },
  'ta-IN': { 
    name: 'Tamil',
    responseLang: 'ta',
    errorMessage: 'தயவு செய்து மீண்டும் முயற்சிக்கவும் அல்லது உங்கள் வினவலை தெளிவுபடுத்தவும்.',
    fallbackResponse: 'மன்னிக்கவும், இந்த தகவல் என்னிடம் இல்லை.'
  },
  'en-IN': { 
    name: 'English',
    responseLang: 'en',
    errorMessage: 'Please try again or clarify your query.',
    fallbackResponse: 'Sorry, I don\'t have this information available.'
  }
};

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('hi-IN');
  const [voiceResponse, setVoiceResponse] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const recognitionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const synthRef = useRef(null);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save message to Firestore
  const saveMessageToFirestore = async (prompt, response) => {
    try {
      const messagesCollection = collection(db, "chatMessages");
      
      await addDoc(messagesCollection, {
        userId: currentUser?.uid || "anonymous",
        prompt,
        response,
        language: selectedLang,
        createdAt: serverTimestamp()
      });
      
    } catch (error) {
      console.error("Error saving message to Firestore:", error);
    }
  };

  // Speech Recognition setup
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      console.warn("Voice recognition not supported in this browser");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = selectedLang;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      setInput("");
      setListening(false);
      handleSend(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognitionRef.current?.stop();
    };
  }, [selectedLang]);

  // Speech Synthesis setup
  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    
    const handleVoicesChanged = () => {
      // Voices loaded callback
    };

    synthRef.current.addEventListener('voiceschanged', handleVoicesChanged);
    
    return () => {
      synthRef.current.removeEventListener('voiceschanged', handleVoicesChanged);
      synthRef.current.cancel();
    };
  }, []);

  const speakText = (text) => {
    if (!voiceResponse || !text || !synthRef.current) return;
    
    synthRef.current.cancel();
    
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLang;
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      const voices = synthRef.current.getVoices();
      const preferredVoice = voices.find(v => v.lang === selectedLang) || voices[0];
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
      };

      synthRef.current.speak(utterance);
    }, 100);
  };

  const validateResponseLanguage = (text, expectedLang) => {
    const langPatterns = {
      'hi': /[\u0900-\u097F]/,
      'mr': /[\u0900-\u097F\u1CD0-\u1CFF]/,
      'ta': /[\u0B80-\u0BFF]/,
      'en': /[a-zA-Z]/
    };

    if (langPatterns[expectedLang].test(text)) {
      return text;
    }

    return LANGUAGE_CONFIG[selectedLang].fallbackResponse;
  };

  const handleSend = async (promptOverride = "") => {
    const newPrompt = promptOverride || input.trim();
    if (!newPrompt) return;

    setInput("");
    setLoading(true);

    const userMsg = { role: "user", content: newPrompt };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const langConfig = LANGUAGE_CONFIG[selectedLang];
      const systemInstruction = `You are an expert multilingual assistant for Indian users. Follow these rules STRICTLY:
1. Respond ONLY in ${langConfig.name} (${langConfig.responseLang}) language
2. Never translate or switch languages
3. For unknown information, respond with: "${langConfig.fallbackResponse}"
4. Maintain natural conversational style
5. For technical terms, provide both native term and simple explanation
6. Handle all topics - government schemes, technology, education, health, etc.

Query: ${newPrompt}`;

      const aiReply = await sendToGemini(systemInstruction);
      
      const validatedResponse = validateResponseLanguage(aiReply, langConfig.responseLang);
      const aiMsg = { role: "ai", content: validatedResponse };
      setMessages((prev) => [...prev, aiMsg]);
      
      // Save the conversation to Firestore
      await saveMessageToFirestore(newPrompt, validatedResponse);
      
      if (voiceResponse) {
        speakText(validatedResponse);
      }
    } catch (err) {
      console.error("Error:", err);
      const errorMsg = {
        role: "ai",
        content: `❌ ${LANGUAGE_CONFIG[selectedLang].errorMessage}`
      };
      setMessages((prev) => [...prev, errorMsg]);
      
      // Save error message to Firestore
      await saveMessageToFirestore(newPrompt, errorMsg.content);
    } finally {
      setLoading(false);
    }
  };

  const startListening = () => {
    if (!listening) {
      recognitionRef.current?.start();
      setListening(true);
    }
  };

  const handleClear = () => {
    setMessages([]);
    setInput("");
    synthRef.current?.cancel();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickPrompt = (prompt) => {
    if (!loading) {
      handleSend(prompt);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          🎙️ भारतीय बहुभाषिक सहायक
        </h2>
        
        <div className="flex gap-3 items-center">
          <select 
            value={selectedLang}
            onChange={(e) => setSelectedLang(e.target.value)}
            className="p-2 rounded-md border bg-white"
          >
            {Object.entries(LANGUAGE_CONFIG).map(([code, { name }]) => (
              <option key={code} value={code}>{name}</option>
            ))}
          </select>

          <Button 
            onClick={() => setVoiceResponse(!voiceResponse)}
            variant={voiceResponse ? "default" : "outline"}
            size="sm"
            aria-label={voiceResponse ? "Mute voice responses" : "Unmute voice responses"}
          >
            {voiceResponse ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {[
          "सुकन्या समृद्धि योजना",
          "महिलाओं के लिए छात्रवृत्ति",
          "ब्लॉकचेन क्या है?",
          "आयुष्मान भारत योजना",
          "नई शिक्षा नीति"
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
            टाइप करके, बोलकर या क्विक प्रॉम्प्ट चुनकर बातचीत शुरू करें
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
            <span>प्रसंस्करण...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="कुछ भी पूछें..."
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
            {loading ? <LoaderCircle className="animate-spin w-4 h-4" /> : "भेजें"}
          </Button>

          <Button 
            variant="outline" 
            onClick={startListening} 
            disabled={loading}
            className="aspect-square p-2"
            aria-label={listening ? "Stop listening" : "Start listening"}
          >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </Button>

          <Button
            variant="ghost"
            onClick={handleClear}
            disabled={loading}
            className="flex-grow sm:flex-grow-0"
          >
            साफ करें
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatAssistant;