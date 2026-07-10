"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import Image from "next/image";

const SHORTCUTS = [
  {
    href: "/cycle-tracker",
    label: "Cycle Tracker",
    desc: "Manage your cycle",
    from: "#EFE9FB",
    to: "#F6F2FC",
    badge: "#7C3AED",
    illo: "drop",
  },
  {
    href: "/mental-wellness",
    label: "Mental Wellness",
    desc: "Mind & mood check-ins",
    from: "#EFE9FB",
    to: "#F6F2FC",
    badge: "#7C3AED",
    illo: "brain",
  },
  {
    href: "/pregnancy",
    label: "Pregnancy",
    desc: "Week-by-week care",
   from: "#EFE9FB",
    to: "#F6F2FC",
    badge: "#7C3AED",
    illo: "bump",
  },
  {
    href: "/health-twin",
    label: "Health Twin",
    desc: "Your AI wellness profile",
    from: "#EFE9FB",
    to: "#F6F2FC",
    badge: "#7C3AED",
    illo: "twin",
  },
];

function Illustration({ type }) {
  const images = {
    drop: "/images/Menstrual calendar-amico.png",
    brain: "/images/Mental health-amico.png",
    bump: "/images/Pregnancy stages-amico.png",
    twin: "/images/Healthy habit-bro.png",
  };

  return (
    <Image
      src={images[type]}
      alt={type}
      width={130}
      height={130}
      className="object-contain"
    />
  );
}
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function WellnessRing({ score }) {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const dotAngle = (score / 100) * 360 - 90;
  const dotX = 80 + radius * Math.cos((dotAngle * Math.PI) / 180);
  const dotY = 80 + radius * Math.sin((dotAngle * Math.PI) / 180);

  return (
    <div className="relative w-[160px] h-[160px] shrink-0">
      <svg
        width="160" height="160" viewBox="0 0 160 160"
        className="absolute inset-0"
        style={{ animation: "spin-slow 18s linear infinite" }}
      >
        <circle cx="80" cy="80" r="76" stroke="#EFE9FB" strokeWidth="1" fill="none" strokeDasharray="1 7" />
      </svg>

      <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F2733F" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={radius} stroke="#F1ECFB" strokeWidth="11" fill="none" />
        <circle
          cx="80" cy="80" r={radius}
          stroke="url(#ringGradient)"
          strokeWidth="11"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>

      <div
        className="absolute w-2.5 h-2.5 rounded-full bg-white shadow-md border-2"
        style={{ left: dotX - 5, top: dotY - 5, borderColor: "#7C3AED" }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-semibold text-[#251C35]" style={{ fontFamily: "'Fraunces', serif" }}>
          {score}
        </span>
        <span className="text-[9px] uppercase tracking-wide text-[#8A8299] mt-0.5">Wellness Score</span>
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [reminders, setReminders] = useState([]);
  const [cyclePrediction, setCyclePrediction] = useState(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result = await apiCall("/dashboard/summary");
        setData(result);

        const reminderData = await apiCall("/dashboard/reminders");
        setReminders(reminderData.reminders);
        setCyclePrediction(reminderData.cycle_prediction);
      } catch (err) {
        setError("Could not load dashboard data");
      }
    }
    if (user) fetchDashboard();
  }, [user]);

  if (loading || !user) return <div className="p-10">Loading...</div>;

  const displayName = data?.name || user.email?.split("@")[0] || "there";
  const today = data?.trend_data?.[data.trend_data.length - 1];

  const priorityStyle = {
    high: { bg: "linear-gradient(150deg, #FBE7EC 0%, #FCEEF1 100%)", text: "#B94E68", border: "border-white/60" },
    medium: { bg: "linear-gradient(150deg, #FFF6E8 0%, #FFFBF2 100%)", text: "#B8802F", border: "border-white/60" },
  };
  const reminderIcon = { period: "🩸", medicine: "💊", vaccination: "💉" };

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(160deg, #fbf2fd 0%, #faf7ffcb 45%, #f8f0fb 100%)" }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fade-up 0.5s ease both; }
      `}</style>

      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="mb-6 md:mb-8 fade-up">
          <p className="text-sm text-[#8A8299] mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1 className="text-[26px] md:text-4xl text-[#251C35] leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>
            {getGreeting()}, {displayName}
          </h1>
        </div>

        {error && <p className="text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-6 text-sm">{error}</p>}

        {data && (
          <div className="space-y-5 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              <div
                className="rounded-3xl shadow-sm p-6 flex flex-col items-center justify-center border border-white/60 fade-up"
                style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #FBF7FF 100%)", animationDelay: "0.05s" }}
              >
                <WellnessRing score={data.wellness_score} />
                {today && (
                  <div className="flex gap-4 mt-5 text-center">
                    <div>
                      <p className="text-[11px] text-[#8A8299] uppercase tracking-wide">Mood</p>
                      <p className="text-sm font-semibold text-[#251C35]">{today.mood}/10</p>
                    </div>
                    <div className="w-px bg-[#EFE9FB]" />
                    <div>
                      <p className="text-[11px] text-[#8A8299] uppercase tracking-wide">Sleep</p>
                      <p className="text-sm font-semibold text-[#251C35]">{today.sleep}h</p>
                    </div>
                    <div className="w-px bg-[#EFE9FB]" />
                    <div>
                      <p className="text-[11px] text-[#8A8299] uppercase tracking-wide">Stress</p>
                      <p className="text-sm font-semibold text-[#251C35]">{today.stress}/10</p>
                    </div>
                  </div>
                )}
              </div>

              <div
                className="rounded-3xl shadow-sm p-6 md:col-span-2 border border-white/60 relative overflow-hidden fade-up"
                style={{ background: "linear-gradient(135deg, #FFF9F2 0%, #FDF3EE 100%)", animationDelay: "0.1s" }}
              >
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7C3AED] to-[#F2733F]" />
                <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-2 pl-2">AI Recommendation</p>
                <p className="text-lg md:text-xl text-[#251C35] pl-2 leading-relaxed" style={{ fontFamily: "'Fraunces', serif" }}>
                  {data.recommendation}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {SHORTCUTS.map((s, i) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="rounded-2xl shadow-sm border border-white/60 p-4 flex flex-col justify-between gap-6 hover:shadow-md hover:-translate-y-1 transition-all fade-up min-h-[140px]"
                  style={{ background: `linear-gradient(150deg, ${s.from} 0%, ${s.to} 100%)`, animationDelay: `${0.12 + i * 0.05}s` }}
                >
                  <div>
                    <p className="text-sm font-semibold text-[#251C35] leading-tight">{s.label}</p>
                    <p className="text-xs text-[#6B6478] mt-0.5">{s.desc}</p>
                  </div>
                  <div className="self-end">
                  <Illustration type={s.illo} />
                </div>
                </Link>
              ))}
            </div>

            <div
              className="rounded-3xl shadow-sm p-5 md:p-6 border border-white/60 fade-up"
              style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #FBF9FE 100%)", animationDelay: "0.3s" }}
            >
              <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">Weekly Trends</p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.trend_data} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.22} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1ECFB" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8A8299" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#8A8299" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #F1ECFB", fontSize: 13 }} />
                  <Area type="monotone" dataKey="mood" stroke="#7C3AED" strokeWidth={2.5} fill="url(#moodFill)" name="Mood" />
                  <Area type="monotone" dataKey="sleep" stroke="#2DAEE0" strokeWidth={1.8} fill="transparent" name="Sleep" />
                  <Area type="monotone" dataKey="stress" stroke="#F2733F" strokeWidth={1.8} fill="transparent" name="Stress" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs text-[#8A8299]"><span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" /> Mood</span>
                <span className="flex items-center gap-1.5 text-xs text-[#8A8299]"><span className="w-2.5 h-2.5 rounded-full bg-[#2DAEE0]" /> Sleep</span>
                <span className="flex items-center gap-1.5 text-xs text-[#8A8299]"><span className="w-2.5 h-2.5 rounded-full bg-[#F2733F]" /> Stress</span>
              </div>
            </div>

            {/* Smart Reminders Card — same design language as rest of dashboard */}
            <div
              className="rounded-3xl shadow-sm p-5 md:p-6 border border-white/60 fade-up"
              style={{ background: "linear-gradient(160deg, #FFFFFF 0%, #FBF9FE 100%)", animationDelay: "0.35s" }}
            >
              <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">🔔 Upcoming Reminders</p>
              {reminders.length === 0 ? (
                <p className="text-sm text-[#8A8299]">No reminders right now. Log your data to get personalized reminders!</p>
              ) : (
                <div className="space-y-2">
                  {reminders.map((r, i) => {
                    const style = priorityStyle[r.priority] || priorityStyle.medium;
                    return (
                      <div
                        key={i}
                        className={`p-3 rounded-xl border ${style.border} flex justify-between items-center`}
                        style={{ background: style.bg }}
                      >
                        <span className="text-sm" style={{ color: style.text }}>
                          {reminderIcon[r.type]} {r.title}
                        </span>
                        <span className="text-xs" style={{ color: style.text }}>
                          {r.days_until === 0 ? "Today" : r.days_until > 0 ? `in ${r.days_until} days` : "Overdue"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cyclePrediction && (
              <div
                className="rounded-3xl shadow-sm p-6 border border-white/60 text-center fade-up"
                style={{ background: "linear-gradient(150deg, #EFE9FB 0%, #F6F2FC 100%)", animationDelay: "0.4s" }}
              >
                <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-1">Predicted Next Period</p>
                <p className="text-2xl text-[#251C35]" style={{ fontFamily: "'Fraunces', serif" }}>
                  {cyclePrediction.predicted_date}
                </p>
                <p className="text-xs text-[#8A8299] mt-1">
                  Based on your average {cyclePrediction.avg_cycle_length}-day cycle
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}