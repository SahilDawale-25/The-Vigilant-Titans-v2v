"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

const TIME_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "night", label: "Night" },
];

function BumpIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M9 3.5c-2.8.7-4.5 3.4-4.5 6.7 0 3 1.6 5 1.6 7.3 0 2 1.6 3.5 3.6 3.5h4.6c2 0 3.6-1.6 3.6-3.6 0-1.6.9-2.4 1.6-3.7.9-1.7.7-4.1-.6-5.8"
        strokeWidth="1.6" strokeLinecap="round"
      />
      <circle cx="14.5" cy="5.2" r="1.9" strokeWidth="1.6" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 3l10 18H2L12 3Z" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M12 10v4" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="17" r="0.9" fill="currentColor" />
    </svg>
  );
}

function PillIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <rect x="3" y="9" width="18" height="6" rx="3" strokeWidth="1.6" transform="rotate(-25 12 12)" />
      <path d="M12 12l3-3" strokeWidth="1.6" strokeLinecap="round" transform="rotate(-25 12 12)" />
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

const inputClass =
  "w-full p-3 border border-[#EFE9FB] rounded-xl text-sm text-[#251C35] placeholder:text-[#C4BDDB] focus:outline-none focus:ring-2 focus:ring-[#7C3AED33] focus:border-[#7C3AED]";

export default function PregnancyPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [dueDate, setDueDate] = useState("");
  const [weekInfo, setWeekInfo] = useState(null);
  const [emergencySymptoms, setEmergencySymptoms] = useState([]);
  const [medicineName, setMedicineName] = useState("");
  const [timeOfDay, setTimeOfDay] = useState("morning");
  const [reminders, setReminders] = useState([]);
  const [message, setMessage] = useState("");
  const [savingDate, setSavingDate] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadWeekInfo();
      loadEmergencyChecklist();
      loadReminders();
    }
  }, [user]);

  async function loadWeekInfo() {
    try {
      const data = await apiCall("/pregnancy/week-info");
      setWeekInfo(data);
    } catch (err) {
      setWeekInfo(null);
    }
  }

  async function loadEmergencyChecklist() {
    try {
      const data = await apiCall("/pregnancy/emergency-checklist");
      setEmergencySymptoms(data.symptoms);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadReminders() {
    try {
      const data = await apiCall("/pregnancy/medicine-reminders");
      setReminders(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDueDateSubmit(e) {
    e.preventDefault();
    setSavingDate(true);
    try {
      await apiCall("/pregnancy/profile", {
        method: "POST",
        body: JSON.stringify({ due_date: dueDate }),
      });
      setMessage("Due date saved!");
      loadWeekInfo();
    } catch (err) {
      setMessage("Error saving due date");
    } finally {
      setSavingDate(false);
    }
  }

  async function handleReminderSubmit(e) {
    e.preventDefault();
    try {
      await apiCall("/pregnancy/medicine-reminder", {
        method: "POST",
        body: JSON.stringify({ medicine_name: medicineName, time_of_day: timeOfDay }),
      });
      setMedicineName("");
      loadReminders();
    } catch (err) {
      console.error(err);
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
            <BumpIcon />
          </div>
          <div>
            <h1
              className="text-[26px] md:text-3xl text-[#251C35] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Pregnancy Companion
            </h1>
            <p className="text-sm text-[#8A8299]">Week-by-week guidance, reminders & safety info</p>
          </div>
        </div>

        {!weekInfo && (
          <div className="max-w-md">
            <SectionCard title="Set Your Due Date">
              <form onSubmit={handleDueDateSubmit} className="space-y-4">
                <input
                  type="date"
                  className={inputClass}
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  disabled={savingDate}
                  className="w-full bg-[#3F9142] text-white p-3 rounded-xl font-medium hover:bg-[#357A38] transition-colors disabled:opacity-60"
                >
                  {savingDate ? "Saving..." : "Save"}
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

        {weekInfo && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {/* Week Info Card */}
            <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-6 md:col-span-2 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#3F9142] to-[#7C3AED]" />
              <div className="pl-2">
                <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-1">
                  Week {weekInfo.current_week}
                </p>
                <p
                  className="text-2xl md:text-3xl text-[#251C35] mb-3"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  Your baby is the size of a {weekInfo.baby_size}
                </p>
                <p className="text-sm text-[#8A8299] mb-3">({weekInfo.baby_size_cm} cm)</p>
                <p className="text-sm text-[#251C35] leading-relaxed mb-4">{weekInfo.development}</p>
                <div className="p-3.5 bg-[#FAF7FF] rounded-xl text-sm text-[#251C35] flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 shrink-0" />
                  {weekInfo.tip}
                </div>
              </div>
            </div>

            {/* Medicine Reminders */}
            <SectionCard title="Medicine Reminders">
              <form onSubmit={handleReminderSubmit} className="space-y-3 mb-4">
                <input
                  type="text"
                  placeholder="Medicine name"
                  className={inputClass}
                  value={medicineName}
                  onChange={(e) => setMedicineName(e.target.value)}
                  required
                />
                <select
                  className={inputClass + " bg-white"}
                  value={timeOfDay}
                  onChange={(e) => setTimeOfDay(e.target.value)}
                >
                  {TIME_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full bg-[#3F9142] text-white p-2.5 rounded-xl font-medium hover:bg-[#357A38] transition-colors"
                >
                  Add Reminder
                </button>
              </form>
              <ul className="space-y-2">
                {reminders.map((r) => (
                  <li
                    key={r.id}
                    className="p-3 bg-[#FAF7FF] rounded-xl text-sm text-[#251C35] flex items-center gap-2.5"
                  >
                    <span className="text-[#3F9142]"><PillIcon /></span>
                    {r.medicine_name} — {r.time_of_day}
                  </li>
                ))}
                {reminders.length === 0 && (
                  <p className="text-[#C4BDDB] text-sm py-2 text-center">No reminders yet.</p>
                )}
              </ul>
            </SectionCard>

            {/* Emergency Checklist */}
            <SectionCard title="Seek Immediate Care If">
              <div className="flex items-center gap-2 mb-3 text-[#B23A2E]">
                <AlertIcon />
                <span className="text-sm font-semibold">Emergency Symptoms</span>
              </div>
              <ul className="space-y-2">
                {emergencySymptoms.map((s, i) => (
                  <li
                    key={i}
                    className="text-sm p-3 rounded-xl flex items-start gap-2"
                    style={{ backgroundColor: "#FDECEB", color: "#B23A2E" }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E24C3B] mt-1.5 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </SectionCard>
          </div>
        )}
      </div>
    </div>
  );
}