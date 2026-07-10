"use client";
import { useEffect, useState, useRef } from "react";

function SparkleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"
        strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 12l16-8-6 8 6 8-16-8Z" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="5.5" width="13" height="13" rx="2.5" strokeWidth="1.6" />
      <path d="M16 9.5l5-2.5v10l-5-2.5" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

export default function TeenWellnessPage() {
  const [items, setItems] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [videoGuides, setVideoGuides] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    loadMythsFacts();
    loadVideoGuides();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, loading]);

  async function loadMythsFacts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teen/myths-facts`);
    const data = await res.json();
    setItems(data.items || []);
  } catch (err) {
    console.error(err);
  }
}

  async function loadVideoGuides() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/teen/video-guides`);
      const data = await res.json();
      setVideoGuides(data.guides);
    } catch (err) {
      console.error(err);
    }
  }

  function toggleFlip(id) {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleAskQuestion(e) {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setChatHistory((prev) => [...prev, { role: "user", text: userQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/teen/anonymous-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: "ai", text: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-11 h-11 rounded-2xl bg-[#2563EB1A] flex items-center justify-center shrink-0 text-[#2563EB]">
            <SparkleIcon />
          </div>
          <div>
            <h1
              className="text-[26px] md:text-3xl text-[#251C35] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Teen Wellness
            </h1>
            <p className="text-sm text-[#8A8299]">A safe, judgment-free space to learn and ask questions</p>
          </div>
        </div>

        {/* Top Section: Myth vs Fact + Video Guides side by side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* ================= Myth vs Fact ================= */}
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-3">Myth vs Fact</p>
            <div className="space-y-3">
              {items.map((item) => {
                const isFlipped = flipped[item.id];
                return (
                  <div
                    key={item.id}
                    onClick={() => toggleFlip(item.id)}
                    className="bg-white rounded-2xl shadow-sm border border-[#F1ECFB] p-4 md:p-5 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    <p className="text-sm text-[#251C35] leading-relaxed">
                      <span className={`font-semibold ${isFlipped ? "text-[#3F9142]" : "text-[#E24C3B]"}`}>
                        {isFlipped ? "Fact: " : "Myth: "}
                      </span>
                      {isFlipped ? item.fact : item.myth}
                    </p>
                    <p className="text-xs text-[#C4BDDB] mt-2">
                      Tap to {isFlipped ? "see myth" : "reveal fact"}
                    </p>
                  </div>
                );
              })}
              {items.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#F1ECFB] p-5 text-center text-sm text-[#C4BDDB]">
                  Loading...
                </div>
              )}
            </div>
          </div>

          {/* ================= Video Guides ================= */}
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-3">Video Guides</p>
            <div className="space-y-3">
              {videoGuides.map((guide) => (
                <div
                  key={guide.id}
                  className="bg-white rounded-2xl shadow-sm border border-[#F1ECFB] p-4 md:p-5"
                >
                  <div className="flex items-center gap-2 mb-3.5">
                    <span className="w-8 h-8 rounded-xl bg-[#2563EB1A] flex items-center justify-center text-[#2563EB] shrink-0">
                      <VideoIcon />
                    </span>
                    <p className="font-semibold text-[#251C35] text-sm">{guide.topic}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={guide.videos.english}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-full bg-[#EFF4FE] text-[#2563EB] text-xs font-medium hover:bg-[#E1EAFC] transition-colors"
                    >
                      English
                    </a>
                    <a
                      href={guide.videos.hindi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-full bg-[#FDF1E9] text-[#C97B3F] text-xs font-medium hover:bg-[#FBE7D6] transition-colors"
                    >
                      हिन्दी
                    </a>
                    <a
                      href={guide.videos.marathi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-full bg-[#EEF7EF] text-[#3F9142] text-xs font-medium hover:bg-[#E1F0E3] transition-colors"
                    >
                      मराठी
                    </a>
                  </div>
                </div>
              ))}
              {videoGuides.length === 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-[#F1ECFB] p-5 text-center text-sm text-[#C4BDDB]">
                  Loading video guides...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= Anonymous Chat ================= */}
        <div className="mt-6">
          <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6 flex flex-col h-[550px] md:h-[650px]">
            <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-1">Anonymous Q&A</p>
            <p className="text-xs text-[#C4BDDB] mb-4">No sign-in needed. Your questions stay private.</p>

            <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1">
              {chatHistory.length === 0 && !loading && (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-10 h-10 rounded-xl bg-[#2563EB1A] flex items-center justify-center mb-2 text-[#2563EB]">
                    <SparkleIcon />
                  </div>
                  <p className="text-sm text-[#8A8299]">Ask anything about puberty, periods, or body health.</p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
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
              {loading && (
                <div className="bg-[#FAF7FF] text-[#8A8299] text-sm p-3 rounded-2xl max-w-[60%] flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4BDDB] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4BDDB] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C4BDDB] animate-bounce" />
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask anything..."
                className="flex-1 p-3 border border-[#EFE9FB] rounded-xl text-sm text-[#251C35] placeholder:text-[#C4BDDB] focus:outline-none focus:ring-2 focus:ring-[#7C3AED33] focus:border-[#7C3AED]"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
              />
              <button
                type="submit"
                className="bg-[#7C3AED] text-white px-4 rounded-xl hover:bg-[#6B21D8] transition-colors shrink-0"
                aria-label="Send"
              >
                <SendIcon />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}