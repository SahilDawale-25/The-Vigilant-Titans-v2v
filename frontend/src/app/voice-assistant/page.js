"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";
import { auth } from "../../lib/firebase";

const LANGUAGES = [
  { code: "en", label: "English", speechLang: "en-US" },
  { code: "hi", label: "हिंदी (Hindi)", speechLang: "hi-IN" },
  { code: "mr", label: "मराठी (Marathi)", speechLang: "mr-IN" },
];

function MicIcon({ className }) {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" className={className}>
      <rect x="9" y="2.5" width="6" height="11" rx="3" strokeWidth="1.7" />
      <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3.5M9 21.5h6" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export default function VoiceAssistantPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [language, setLanguage] = useState("en");
  const [listening, setListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [processing, setProcessing] = useState(false);
  const recognitionRef = useRef(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, processing]);

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

  async function speakResponse(text) {
  try {
    const token = await auth.currentUser.getIdToken();
    const res = await fetch("http://localhost:8000/ai/voice-assistant/speak", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ text, language }),
    });

    if (!res.ok) throw new Error("TTS generation failed");

    const audioBlob = await res.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    audio.play();
  } catch (err) {
    console.error("TTS error:", err);
    // Fallback: browser cha default TTS vapра jar backend fail zala
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      const selectedLang = LANGUAGES.find((l) => l.code === language);
      utterance.lang = selectedLang.speechLang;
      window.speechSynthesis.speak(utterance);
    }
  }
}

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF7FF] flex items-center justify-center">
        <p className="text-[#8A8299] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        className="max-w-2xl mx-auto px-4 py-6 md:px-8 md:py-10 flex flex-col items-center"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h1
            className="text-[26px] md:text-3xl text-[#251C35] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            AI Voice Assistant
          </h1>
          <p className="text-sm text-[#8A8299] mt-1">
            Speak naturally — I'll respond in your chosen language
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex gap-2 mb-8 flex-wrap justify-center">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                language === lang.code
                  ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                  : "bg-white text-[#8A8299] border-[#EFE9FB] hover:border-[#7C3AED66]"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Mic Button */}
        <div className="relative">
          {listening && (
            <span className="absolute inset-0 rounded-full bg-[#7C3AED] opacity-30 animate-ping" />
          )}
          <button
            onClick={startListening}
            disabled={listening || processing}
            className={`relative w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-colors ${
              listening ? "bg-[#F2733F]" : "bg-[#7C3AED] hover:bg-[#6B21D8]"
            } text-white disabled:opacity-70`}
          >
            <MicIcon />
          </button>
        </div>
        <p className="text-sm text-[#8A8299] mt-3">
          {listening ? "Listening..." : processing ? "Thinking..." : "Tap to speak"}
        </p>

        {/* Conversation */}
        <div className="w-full mt-8 bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6 space-y-3 max-h-96 overflow-y-auto">
          {messages.length === 0 && (
            <div className="py-8 flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-xl bg-[#7C3AED1A] flex items-center justify-center mb-2 text-[#7C3AED]">
                <MicIcon className="w-5 h-5" />
              </div>
              <p className="text-[#8A8299] text-sm">Your conversation will appear here.</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl text-sm max-w-[85%] leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#7C3AED] text-white ml-auto"
                  : "bg-[#FAF7FF] text-[#251C35]"
              }`}
            >
              {msg.text}
            </div>
          ))}
          {processing && (
            <div className="bg-[#FAF7FF] text-[#8A8299] text-sm p-3 rounded-2xl max-w-[60%] flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4BDDB] animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4BDDB] animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-[#C4BDDB] animate-bounce" />
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
      </div>
    </div>
  );
}