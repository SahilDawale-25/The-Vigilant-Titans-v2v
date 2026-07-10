"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

const SHORTCUTS = [
  { href: "/cycle-tracker", label: "Cycle Tracker", desc: "Log & predict", color: "#7C3AED", icon: "cycle" },
  { href: "/mental-wellness", label: "Mental Wellness", desc: "Mood & stress", color: "#F2733F", icon: "heart" },
  { href: "/pregnancy", label: "Pregnancy", desc: "Week-by-week", color: "#3F9142", icon: "baby" },
  { href: "/health-twin", label: "Health Twin", desc: "Your AI profile", color: "#2563EB", icon: "twin" },
];

const ICONS = {
  cycle: <path d="M12 3v4m0 10v4m9-9h-4M7 12H3m14.14-6.14l-2.83 2.83M9.69 15.31l-2.83 2.83m11.28 0l-2.83-2.83M9.69 8.69L6.86 5.86" strokeWidth="1.7" strokeLinecap="round" />,
  heart: <path d="M12 20s-7-4.35-9.5-8.8C.8 7.9 2.3 4.5 5.6 4A4.7 4.7 0 0 1 12 6.5 4.7 4.7 0 0 1 18.4 4c3.3.5 4.8 3.9 3.1 6.7C19 15.65 12 20 12 20Z" strokeWidth="1.7" strokeLinejoin="round" />,
  baby: <><circle cx="12" cy="7" r="3.2" strokeWidth="1.7" /><path d="M6 20c0-3.5 2.7-6.2 6-6.2s6 2.7 6 6.2" strokeWidth="1.7" strokeLinecap="round" /></>,
  twin: <><circle cx="8.5" cy="9" r="2.8" strokeWidth="1.7" /><circle cx="15.5" cy="9" r="2.8" strokeWidth="1.7" /><path d="M3.5 19c0-2.9 2.2-5.2 5-5.2s5 2.3 5 5.2M10.5 19c0-2.9 2.2-5.2 5-5.2s5 2.3 5 5.2" strokeWidth="1.7" strokeLinecap="round" /></>,
};

function Icon({ name, color }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color}>
      {ICONS[name]}
    </svg>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function WellnessRing({ score }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-[150px] h-[150px] shrink-0">
      <svg width="150" height="150" viewBox="0 0 150 150" className="-rotate-90">
        <defs>
          <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#F2733F" />
          </linearGradient>
        </defs>
        <circle cx="75" cy="75" r={radius} stroke="#EFE9FB" strokeWidth="12" fill="none" />
        <circle
          cx="75" cy="75" r={radius}
          stroke="url(#ringGradient)"
          strokeWidth="12"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="text-4xl font-semibold text-[#251C35]"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {score}
        </span>
        <span className="text-[11px] uppercase tracking-wide text-[#8A8299] mt-0.5">
          Wellness
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result = await apiCall("/dashboard/summary");
        setData(result);
      } catch (err) {
        setError("Could not load dashboard data");
      }
    }
    if (user) fetchDashboard();
  }, [user]);

  if (loading || !user) return <div className="p-10">Loading...</div>;

  const displayName = data?.name || user.email?.split("@")[0] || "there";
  const today = data?.trend_data?.[data.trend_data.length - 1];

  return (
    <div className="min-h-screen bg-[#FAF7FF]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div className="max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Greeting */}
        <div className="mb-6 md:mb-8">
          <p className="text-sm text-[#8A8299] mb-1">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
          <h1
            className="text-[28px] md:text-4xl text-[#251C35] leading-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {getGreeting()}, {displayName}
          </h1>
        </div>

        {error && (
          <p className="text-red-500 bg-red-50 rounded-xl px-4 py-3 mb-6 text-sm">{error}</p>
        )}

        {data && (
          <div className="space-y-5 md:space-y-6">
            {/* Score + Recommendation row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
              <div className="bg-white rounded-3xl shadow-sm p-6 flex flex-col items-center justify-center border border-[#F1ECFB]">
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

              <div className="bg-white rounded-3xl shadow-sm p-6 md:col-span-2 border border-[#F1ECFB] relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7C3AED] to-[#F2733F]" />
                <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-2 pl-2">
                  AI Recommendation
                </p>
                <p className="text-lg md:text-xl text-[#251C35] pl-2 leading-relaxed" style={{ fontFamily: "'Fraunces', serif" }}>
                  {data.recommendation}
                </p>
              </div>
            </div>

            {/* Shortcuts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {SHORTCUTS.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="bg-white rounded-2xl shadow-sm border border-[#F1ECFB] p-4 flex flex-col gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${s.color}1A` }}
                  >
                    <Icon name={s.icon} color={s.color} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#251C35] leading-tight">{s.label}</p>
                    <p className="text-xs text-[#8A8299] mt-0.5">{s.desc}</p>
                  </div>
                </Link>
              ))}
            </div>

            {/* Trend Chart */}
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6 border border-[#F1ECFB]">
              <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">
                Weekly Trends
              </p>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={data.trend_data} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="moodFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#7C3AED" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1ECFB" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#8A8299" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: "#8A8299" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: "1px solid #F1ECFB", fontSize: 13 }}
                  />
                  <Area type="monotone" dataKey="mood" stroke="#7C3AED" strokeWidth={2.5} fill="url(#moodFill)" name="Mood" />
                  <Area type="monotone" dataKey="sleep" stroke="#2DAEE0" strokeWidth={2} fill="transparent" name="Sleep" />
                  <Area type="monotone" dataKey="stress" stroke="#F2733F" strokeWidth={2} fill="transparent" name="Stress" />
                </AreaChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-2 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs text-[#8A8299]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]" /> Mood
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#8A8299]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#2DAEE0]" /> Sleep
                </span>
                <span className="flex items-center gap-1.5 text-xs text-[#8A8299]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F2733F]" /> Stress
                </span>
              </div>
            </div>

            {/* Reminders */}
            <div className="bg-white rounded-3xl shadow-sm p-5 md:p-6 border border-[#F1ECFB]">
              <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">
                Upcoming Reminders
              </p>
              <ul className="space-y-2">
                {data.upcoming_reminders.map((r, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-3.5 bg-[#FAF7FF] rounded-xl text-sm text-[#251C35]"
                  >
                    <span
                      className={`w-2 h-2 rounded-full shrink-0 ${
                        r.type === "daily" ? "bg-[#7C3AED]" : "bg-[#F2733F]"
                      }`}
                    />
                    {r.title}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}