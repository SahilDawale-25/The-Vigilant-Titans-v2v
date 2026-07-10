"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

function BabyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="12" cy="7" r="3.2" strokeWidth="1.7" />
      <path d="M6 20c0-3.5 2.7-6.2 6-6.2s6 2.7 6 6.2" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function SyringeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M19 5l-9.5 9.5M17 3l4 4M4 20l3-1 8.5-8.5-2-2L5 17l-1 3ZM12.5 6.5l2 2M10.5 8.5l2 2"
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

function SectionCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6 ${className}`}>
      <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">{title}</p>
      {children}
    </div>
  );
}

export default function NewMotherPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [babyName, setBabyName] = useState("");
  const [dob, setDob] = useState("");
  const [vaccineData, setVaccineData] = useState(null);
  const [tips, setTips] = useState([]);
  const [moodScore, setMoodScore] = useState(5);
  const [sleepHours, setSleepHours] = useState(6);
  const [supportMessage, setSupportMessage] = useState("");
  const [message, setMessage] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [loggingMood, setLoggingMood] = useState(false);
  const [videoGuides, setVideoGuides] = useState([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadVaccineSchedule();
      loadTips();
      loadVideoGuides();
    }
  }, [user]);

  async function loadVideoGuides() {
    try {
      const res = await fetch("http://localhost:8000/newmother/video-guides");
      const data = await res.json();
      setVideoGuides(data.guides);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadVaccineSchedule() {
    try {
      const data = await apiCall("/newmother/vaccination-schedule");
      setVaccineData(data);
    } catch (err) {
      setVaccineData(null);
    }
  }

  async function loadTips() {
    try {
      const data = await apiCall("/newmother/breastfeeding-guidance");
      setTips(data.tips);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleBabyProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await apiCall("/newmother/baby-profile", {
        method: "POST",
        body: JSON.stringify({ baby_name: babyName, date_of_birth: dob }),
      });
      setMessage("Baby profile saved!");
      loadVaccineSchedule();
    } catch (err) {
      setMessage("Error saving profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleMoodSubmit(e) {
    e.preventDefault();
    setLoggingMood(true);
    try {
      const result = await apiCall("/newmother/mood-log", {
        method: "POST",
        body: JSON.stringify({ mood_score: Number(moodScore), sleep_hours: Number(sleepHours) }),
      });
      setMessage("Mood logged!");
      if (result.supportive_message) setSupportMessage(result.supportive_message);
    } catch (err) {
      setMessage("Error logging mood");
    } finally {
      setLoggingMood(false);
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
        className="max-w-5xl mx-auto px-4 py-6 md:px-8 md:py-10"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6 md:mb-8">
          <div className="w-11 h-11 rounded-2xl bg-[#3F91421A] flex items-center justify-center shrink-0 text-[#3F9142]">
            <BabyIcon />
          </div>
          <div>
            <h1
              className="text-[26px] md:text-3xl text-[#251C35] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              New Mother Care
            </h1>
            <p className="text-sm text-[#8A8299]">Vaccinations, feeding tips & your own wellbeing</p>
          </div>
        </div>

        {!vaccineData && (
          <div className="max-w-md">
            <SectionCard title="Add Baby's Details">
              <form onSubmit={handleBabyProfileSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="Baby's name"
                  className="w-full p-3 border border-[#EFE9FB] rounded-xl text-sm text-[#251C35] placeholder:text-[#C4BDDB] focus:outline-none focus:ring-2 focus:ring-[#7C3AED33] focus:border-[#7C3AED]"
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  required
                />
                <input
                  type="date"
                  className="w-full p-3 border border-[#EFE9FB] rounded-xl text-sm text-[#251C35] focus:outline-none focus:ring-2 focus:ring-[#7C3AED33] focus:border-[#7C3AED]"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="w-full bg-[#3F9142] text-white p-3 rounded-xl font-medium hover:bg-[#357A38] transition-colors disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save"}
                </button>
                {message && (
                  <p className={`text-sm text-center ${message.includes("Error") ? "text-red-500" : "text-[#3F9142]"}`}>
                    {message}
                  </p>
                )}
              </form>
            </SectionCard>
          </div>
        )}

        {vaccineData && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Vaccination Schedule */}
            <SectionCard title={`${vaccineData.baby_name}'s Vaccination Schedule`}>
              <ul className="space-y-2 max-h-80 overflow-y-auto">
                {vaccineData.schedule.map((item, i) => {
                  const due = item.status === "due_or_completed";
                  return (
                    <li
                      key={i}
                      className="p-3.5 rounded-xl text-sm flex items-start gap-2.5"
                      style={{
                        backgroundColor: due ? "#EEF7EF" : "#FAF7FF",
                        color: due ? "#2F7A3D" : "#251C35",
                      }}
                    >
                      <span className={due ? "text-[#3F9142]" : "text-[#8A8299]"}>
                        <SyringeIcon />
                      </span>
                      <span>
                        <strong className="font-semibold">{item.vaccine}</strong>
                        <br />
                        <span className="text-xs opacity-80">Due: {item.due_date}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </SectionCard>

            {/* Breastfeeding Tips */}
            <SectionCard title="Breastfeeding Guidance">
              <ul className="space-y-2.5">
                {tips.map((tip, i) => (
                  <li key={i} className="text-sm text-[#251C35] flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#3F9142] mt-1.5 shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </SectionCard>

            {/* Video Guides */}
            <SectionCard title="Video Guides" className="md:col-span-2">
              <p className="text-sm text-[#8A8299] mb-4 -mt-2">
                Watch simple, step-by-step videos in your preferred language.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {videoGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="p-4 rounded-2xl border border-[#F1ECFB]"
                    style={{ backgroundColor: "#FAF7FF" }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-8 h-8 rounded-xl bg-[#3F91421A] flex items-center justify-center text-[#3F9142] shrink-0">
                        <VideoIcon />
                      </span>
                      <p className="font-semibold text-[#251C35] text-sm">{guide.topic}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={guide.videos.english}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-white text-[#3F9142] px-3 py-1.5 rounded-full hover:bg-[#EEF7EF] transition-colors border border-[#D9EEDA]"
                      >
                        English
                      </a>
                      <a
                        href={guide.videos.hindi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-white text-[#C97B3F] px-3 py-1.5 rounded-full hover:bg-[#FDF1E9] transition-colors border border-[#F5E2CE]"
                      >
                        हिन्दी
                      </a>
                      <a
                        href={guide.videos.marathi}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs bg-white text-[#2563EB] px-3 py-1.5 rounded-full hover:bg-[#EFF4FE] transition-colors border border-[#DCE7FB]"
                      >
                        मराठी
                      </a>
                    </div>
                  </div>
                ))}
                {videoGuides.length === 0 && (
                  <p className="text-[#C4BDDB] text-sm py-2">Loading video guides...</p>
                )}
              </div>
            </SectionCard>

            {/* Postpartum Mood Log */}
            <SectionCard title="How are you feeling today?" className="md:col-span-2">
              <form onSubmit={handleMoodSubmit} className="space-y-4 max-w-md">
                <div>
                  <label className="flex items-center justify-between text-sm text-[#251C35] font-medium mb-2">
                    <span>Mood</span>
                    <span className="text-[#3F9142] font-semibold">{moodScore}/10</span>
                  </label>
                  <input
                    type="range" min="1" max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(e.target.value)}
                    className="w-full accent-[#3F9142]"
                  />
                </div>
                <div>
                  <label className="flex items-center justify-between text-sm text-[#251C35] font-medium mb-2">
                    <span>Sleep Hours</span>
                    <span className="text-[#3F9142] font-semibold">{sleepHours}h</span>
                  </label>
                  <input
                    type="range" min="0" max="12" step="0.5"
                    value={sleepHours}
                    onChange={(e) => setSleepHours(e.target.value)}
                    className="w-full accent-[#3F9142]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loggingMood}
                  className="bg-[#3F9142] text-white px-6 py-2.5 rounded-xl font-medium hover:bg-[#357A38] transition-colors disabled:opacity-60"
                >
                  {loggingMood ? "Logging..." : "Log Mood"}
                </button>
              </form>

              {message && <p className="text-sm text-[#3F9142] mt-3">{message}</p>}

              {supportMessage && (
                <div className="mt-4 p-4 rounded-2xl text-sm flex items-start gap-2.5" style={{ backgroundColor: "#FEF6E8", color: "#96660B" }}>
                  <span className="w-2 h-2 rounded-full bg-[#E0A526] mt-1.5 shrink-0" />
                  {supportMessage}
                </div>
              )}
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}