import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendToGemini } from "../services/aiService";
import { LoaderCircle, Mic, MicOff, Volume2, VolumeX, Globe } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

import { motion, AnimatePresence } from "framer-motion";

const LANGUAGE_CONFIG = {
  'en-IN': {
    name: 'English',
    responseLang: 'en',
    errorMessage: 'Please try again or clarify your query.',
    fallbackResponse: 'Sorry, I don\'t have this information available.'
  },
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
  }
};

const ChatAssistant = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState('en-IN'); // Changed default to English
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

    // Clean text for speech synthesis by removing asterisks
    const cleanTextForSpeech = text.replace(/\*/g, '');

    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(cleanTextForSpeech);
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

  // Update quick prompts based on selected language
  const getQuickPrompts = () => {
    if (selectedLang === 'en-IN') {
      return [
        "What is Sukanya Samriddhi Yojana?",
        "Scholarships for women",
        "What is blockchain?",
        "Ayushman Bharat scheme",
        "New Education Policy"
      ];
    } else {
      return [
        "सुकन्या समृद्धि योजना",
        "महिलाओं के लिए छात्रवृत्ति",
        "ब्लॉकचेन क्या है?",
        "आयुष्मान भारत योजना",
        "नई शिक्षा नीति"
      ];
    }
  };

  const getWelcomeMessage = () => {
    if (selectedLang === 'en-IN') {
      return "Start a conversation by typing, speaking, or selecting a quick prompt";
    } else if (selectedLang === 'hi-IN') {
      return "टाइप करके, बोलकर या क्विक प्रॉम्प्ट चुनकर बातचीत शुरू करें";
    } else if (selectedLang === 'mr-IN') {
      return "टाईप करून, बोलून किंवा क्विक प्रॉम्प्ट निवडून संभाषण सुरू करा";
    } else if (selectedLang === 'ta-IN') {
      return "தட்டச்சு செய்வதன் மூலம், பேசுவதன் மூலம் அல்லது விரைவு தூண்டுதலைத் தேர்ந்தெடுப்பதன் மூலம் உரையாடலைத் தொடங்கவும்";
    }
    return "Start a conversation";
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-white p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <motion.h2 
          className="text-2xl md:text-3xl font-bold text-gray-800"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          🎙️ {selectedLang === 'en-IN' ? 'Indian Multilingual Assistant' : 'भारतीय बहुभाषिक सहायक'}
        </motion.h2>

        <div className="flex gap-3 items-center">
          <motion.div 
            className="flex items-center bg-white rounded-md border p-1"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Globe size={16} className="text-gray-500 ml-1" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="p-1 bg-transparent focus:outline-none"
              aria-label="Select language"
            >
              {Object.entries(LANGUAGE_CONFIG).map(([code, { name }]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </motion.div>

          <motion.div 
            className="relative inline-block"
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={() => setVoiceResponse(!voiceResponse)}
              variant={voiceResponse ? "default" : "outline"}
              size="sm"
              aria-label={voiceResponse ? "Voice output on" : "Voice output off"}
            >
              {voiceResponse ? <Volume2 size={18} /> : <VolumeX size={18} />}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded hidden group-hover:block whitespace-nowrap z-10">
                {voiceResponse ? "Voice output on" : "Voice output off"}
              </div>
            </Button>
            
            {voiceResponse && synthRef.current?.speaking && (
              <motion.div 
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="bg-blue-500 h-1 w-1 rounded-full"
                    animate={{ height: ["2px", "8px", "2px"] }}
                    transition={{
                      repeat: Infinity,
                      repeatType: "reverse",
                      duration: 0.8,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      <motion.div 
        className="flex flex-wrap justify-center gap-3 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <AnimatePresence>
          {getQuickPrompts().map((prompt, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <motion.button
                whileHover={{ scale: 1.05, backgroundColor: "#EBF5FF" }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="px-3 py-1 rounded-lg border border-gray-200 text-sm hover:bg-pink-50 transition-colors"
                onClick={() => handleQuickPrompt(prompt)}
                disabled={loading}
              >
                {prompt}
              </motion.button>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      <motion.div 
        className="flex-1 bg-white rounded-xl shadow-inner p-4 overflow-y-auto border border-gray-200 mb-4 min-h-[40vh] flex flex-col"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {messages.length === 0 && !loading ? (
          <motion.div 
            className="text-gray-400 text-center my-auto flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.p
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
            >
              {getWelcomeMessage()}
            </motion.p>
            <motion.div 
              className="flex gap-2 text-sm bg-pink-50 p-2 rounded-md text-pink-500"
              whileHover={{ y: -2 }}
            >
              <Globe size={16} />
              <p>You can change the language using the selector above</p>
            </motion.div>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`mb-4 max-w-3xl w-fit ${msg.role === "user" ? "ml-auto" : "mr-auto"}`}
              >
                <div
                  className={`inline-block rounded-lg px-4 py-2 text-sm ${msg.role === "user"
                    ? "bg-pink-100 text-pink-800 rounded-br-none"
                    : msg.content.startsWith("❌")
                      ? "bg-red-100 text-red-700 rounded-bl-none"
                      : "bg-gray-100 text-gray-700 rounded-bl-none"
                  }`}
                >
                  {msg.content.split("\n").map((line, i) => (
                    <span key={i}>
                      {/* Process the line to style asterisk-wrapped text */}
                      {line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                          // Style text between asterisks as bold
                          const innerText = part.slice(2, -2);
                          return <strong key={j}>{innerText}</strong>;
                        }
                        return <span key={j}>{part}</span>;
                      })}
                      <br />
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        {loading && (
          <motion.div 
            className="flex justify-start items-center mt-2 text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            >
              <LoaderCircle className="w-4 h-4 mr-2" />
            </motion.div>
            <span>{selectedLang === 'en-IN' ? 'Processing...' : 'प्रसंस्करण...'}</span>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </motion.div>

      <motion.div 
        className="flex flex-col sm:flex-row gap-3 items-center"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={selectedLang === 'en-IN' ? "Ask anything..." : "कुछ भी पूछें..."}
          className="w-full min-h-[3rem] md:min-h-[2.5rem] resize-none"
          rows={1}
          disabled={loading}
        />

        <div className="flex gap-2 w-full sm:w-auto">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="flex-grow sm:flex-grow-0 bg-pink-500 text-white hover:bg-pink-700 disabled:bg-gray-400 disabled:text-gray-300 transition-all duration-300"
            >
              {loading ?
                <LoaderCircle className="animate-spin w-4 h-4" /> :
                selectedLang === 'en-IN' ? "Send" : "भेजें"
              }
            </Button>
          </motion.div>

          <motion.div 
            className="relative inline-block"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="outline"
              onClick={startListening}
              disabled={loading}
              className="aspect-square p-2"
              aria-label={listening ? "Stop listening" : "Start listening"}
            >
              {listening ? <MicOff size={18} /> : <Mic size={18} />}
            </Button>
            
            {listening && (
              <motion.div 
                className="absolute -top-2 -right-2 bg-red-500 rounded-full h-3 w-3"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
            )}
            
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 pointer-events-none">
              {listening ? "Stop voice input" : "Start voice input"}
            </div>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="ghost"
              onClick={handleClear}
              disabled={loading}
              className="flex-grow sm:flex-grow-0"
            >
              {selectedLang === 'en-IN' ? "Clear" : "साफ करें"}
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ChatAssistant;