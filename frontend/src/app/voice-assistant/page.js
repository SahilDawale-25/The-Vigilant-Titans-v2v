"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

const LANGUAGES = [
  { code: "en", label: "English", speechLang: "en-US" },
  { code: "hi", label: "हिंदी (Hindi)", speechLang: "hi-IN" },
  { code: "mr", label: "मराठी (Marathi)", speechLang: "mr-IN" },
];

export default function VoiceAssistantPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [language, setLanguage] = useState("en");
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    // Web Speech API setup (Chrome sathi best support)
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        handleUserSpeech(transcript);
      };

      recognition.onerror = () => setListening(false);
      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
    }
  }, [language]);

  function startListening() {
    if (!recognitionRef.current) {
      alert("Voice recognition is not supported in this browser. Please use Google Chrome.");
      return;
    }
    const selectedLang = LANGUAGES.find((l) => l.code === language);
    recognitionRef.current.lang = selectedLang.speechLang;
    setListening(true);
    recognitionRef.current.start();
  }

  async function handleUserSpeech(transcript) {
    const newMessages = [...messages, { role: "user", text: transcript }];
    setMessages(newMessages);
    setProcessing(true);

    try {
      const data = await apiCall("/ai/voice-assistant/query", {
        method: "POST",
        body: JSON.stringify({
          query: transcript,
          language: language,
          history: newMessages,
        }),
      });

      const updatedMessages = [...newMessages, { role: "assistant", text: data.response }];
      setMessages(updatedMessages);
      speakResponse(data.response);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  }

  function speakResponse(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedLang = LANGUAGES.find((l) => l.code === language);
      utterance.lang = selectedLang.speechLang;
      window.speechSynthesis.speak(utterance);
    }
  }

  if (loading || !user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-indigo-50 p-8 flex flex-col items-center">
      <h1 className="text-3xl font-bold text-indigo-800 mb-2">AI Voice Assistant</h1>
      <p className="text-gray-500 mb-6">Speak naturally — I'll respond in your chosen language.</p>

      {/* Language Selector */}
      <div className="flex gap-2 mb-6">
        {LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`px-4 py-2 rounded-full text-sm ${
              language === lang.code
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600 border border-indigo-200"
            }`}
          >
            {lang.label}
          </button>
        ))}
      </div>

      {/* Mic Button */}
      <button
        onClick={startListening}
        disabled={listening || processing}
        className={`w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-lg transition ${
          listening ? "bg-red-500 animate-pulse" : "bg-indigo-600 hover:bg-indigo-700"
        } text-white disabled:opacity-70`}
      >
        🎤
      </button>
      <p className="text-sm text-gray-500 mt-2">
        {listening ? "Listening..." : processing ? "Thinking..." : "Tap to speak"}
      </p>

      {/* Conversation */}
      <div className="w-full max-w-2xl mt-8 bg-white rounded-2xl shadow-md p-6 space-y-3 max-h-96 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-gray-400 text-sm text-center">Your conversation will appear here.</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-3 rounded-lg text-sm max-w-[85%] ${
              msg.role === "user" ? "bg-indigo-100 ml-auto text-indigo-900" : "bg-gray-100 text-gray-700"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
}