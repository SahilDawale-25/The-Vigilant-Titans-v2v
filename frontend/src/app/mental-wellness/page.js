"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

const MOODS = [
  { emoji: "😊", score: 9, label: "Great" },
  { emoji: "🙂", score: 7, label: "Good" },
  { emoji: "😐", score: 5, label: "Okay" },
  { emoji: "😔", score: 3, label: "Low" },
  { emoji: "😢", score: 1, label: "Struggling" },
];

const RISK_STYLES = {
  low: { bg: "#EEF7EF", text: "#2F7A3D", dot: "#3F9142" },
  moderate: { bg: "#FEF6E8", text: "#96660B", dot: "#E0A526" },
  high: { bg: "#FDECEB", text: "#B23A2E", dot: "#E24C3B" },
  unknown: { bg: "#F5F3F9", text: "#8A8299", dot: "#C4BDDB" },
};

function HeartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M12 20s-7-4.35-9.5-8.8C.8 7.9 2.3 4.5 5.6 4A4.7 4.7 0 0 1 12 6.5 4.7 4.7 0 0 1 18.4 4c3.3.5 4.8 3.9 3.1 6.7C19 15.65 12 20 12 20Z"
        strokeWidth="1.7" strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6 ${className}`}>
      <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">{title}</p>
      {children}
    </div>
  );
}

export default function MentalWellnessPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stressRating, setStressRating] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [burnout, setBurnout] = useState(null);
  const [message, setMessage] = useState("");
  const [savingStress, setSavingStress] = useState(false);
  const [activeMood, setActiveMood] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) loadBurnout();
  }, [user]);

  async function loadBurnout() {
    try {
      const data = await apiCall("/burnout/score");
      setBurnout(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleMoodClick(mood) {
    setActiveMood(mood.label);
    try {
      await apiCall("/mood/log", {
        method: "POST",
        body: JSON.stringify({ mood_emoji: mood.emoji, mood_score: mood.score }),
      });
      setMessage(`Mood logged: ${mood.label}`);
      loadBurnout();
    } catch (err) {
      setMessage("Error logging mood");
    }
  }

  async function handleStressSubmit(e) {
    e.preventDefault();
    setSavingStress(true);
    try {
      await apiCall("/stress/log", {
        method: "POST",
        body: JSON.stringify({
          stress_rating: Number(stressRating),
          sleep_hours: Number(sleepHours),
        }),
      });
      setMessage("Stress & sleep logged!");
      loadBurnout();
    } catch (err) {
      setMessage("Error logging stress");
    } finally {
      setSavingStress(false);
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#FAF7FF] flex items-center justify-center">
        <p className="text-[#8A8299] text-sm">Loading...</p>
      </div>
    );
  }

  const risk = RISK_STYLES[burnout?.risk_level] || RISK_STYLES.unknown;

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
          <div className="w-11 h-11 rounded-2xl bg-[#F2733F1A] flex items-center justify-center shrink-0 text-[#F2733F]">
            <HeartIcon />
          </div>
          <div>
            <h1
              className="text-[26px] md:text-3xl text-[#251C35] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Mental Wellness
            </h1>
            <p className="text-sm text-[#8A8299]">Check in with your mood, stress & sleep</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Mood Logger */}
          <SectionCard title="How are you feeling today?">
            <div className="flex justify-between">
              {MOODS.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => handleMoodClick(mood)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all hover:scale-110 hover:bg-[#FAF7FF] ${
                    activeMood === mood.label ? "bg-[#FAF7FF]" : ""
                  }`}
                >
                  <span className="text-3xl md:text-4xl">{mood.emoji}</span>
                  <span className="text-[11px] text-[#8A8299] font-medium">{mood.label}</span>
                </button>
              ))}
            </div>
          </SectionCard>

          {/* Stress + Sleep Logger */}
          <SectionCard title="Log Stress & Sleep">
            <form onSubmit={handleStressSubmit} className="space-y-4">
              <div>
                <label className="flex items-center justify-between text-sm text-[#251C35] font-medium mb-2">
                  <span>Stress Level</span>
                  <span className="text-[#7C3AED] font-semibold">{stressRating}/10</span>
                </label>
                <input
                  type="range" min="1" max="10"
                  value={stressRating}
                  onChange={(e) => setStressRating(e.target.value)}
                  className="w-full accent-[#7C3AED]"
                />
              </div>
              <div>
                <label className="flex items-center justify-between text-sm text-[#251C35] font-medium mb-2">
                  <span>Sleep Hours</span>
                  <span className="text-[#7C3AED] font-semibold">{sleepHours}h</span>
                </label>
                <input
                  type="range" min="0" max="12" step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full accent-[#7C3AED]"
                />
              </div>
              <button
                type="submit"
                disabled={savingStress}
                className="w-full bg-[#7C3AED] text-white p-3 rounded-xl font-medium hover:bg-[#6B21D8] transition-colors disabled:opacity-60"
              >
                {savingStress ? "Saving..." : "Save"}
              </button>
            </form>
          </SectionCard>

          {/* Burnout Score */}
          {burnout && (
            <div
              className="rounded-3xl shadow-sm p-6 md:col-span-2 flex flex-col md:flex-row md:items-center gap-4 md:gap-8"
              style={{ backgroundColor: risk.bg }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="text-5xl leading-none"
                  style={{ fontFamily: "'Fraunces', serif", color: risk.text }}
                >
                  {burnout.burnout_score}
                </span>
                <div>
                  <p className="text-[11px] uppercase tracking-wide" style={{ color: risk.text, opacity: 0.75 }}>
                    Burnout Risk
                  </p>
                  <p className="text-sm font-semibold" style={{ color: risk.text }}>
                    out of 100
                  </p>
                </div>
              </div>
              <div className="w-px h-10 bg-current opacity-15 hidden md:block" style={{ color: risk.text }} />
              <p className="text-sm leading-relaxed" style={{ color: risk.text }}>
                {burnout.message}
              </p>
            </div>
          )}

          {message && (
            <p className="text-sm text-[#7C3AED] md:col-span-2 text-center">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}