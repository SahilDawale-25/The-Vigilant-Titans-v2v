"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

const FLOW_OPTIONS = [
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
];

function DropIcon({ className }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 3s7 7.6 7 12.2a7 7 0 1 1-14 0C5 10.6 12 3 12 3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CycleTrackerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flow, setFlow] = useState("medium");
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState([]);
  const [insight, setInsight] = useState("");
  const [insightLoading, setInsightLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadHistory();
      loadInsight();
    }
  }, [user]);

  async function loadHistory() {
    try {
      const data = await apiCall("/cycle/history");
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadInsight() {
    setInsightLoading(true);
    try {
      const data = await apiCall("/cycle/insight");
      setInsight(data.insight);
    } catch (err) {
      console.error(err);
    } finally {
      setInsightLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    setSubmitting(true);
    try {
      await apiCall("/cycle/log", {
        method: "POST",
        body: JSON.stringify({
          start_date: startDate,
          end_date: endDate || null,
          flow_intensity: flow,
          symptoms: symptoms,
        }),
      });
      setMessage("Logged successfully!");
      setStartDate("");
      setEndDate("");
      setSymptoms("");
      loadHistory();
      loadInsight();
    } catch (err) {
      setMessage("Something went wrong. Try again.");
    } finally {
      setSubmitting(false);
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
          <div className="w-11 h-11 rounded-2xl bg-[#7C3AED1A] flex items-center justify-center shrink-0">
            <DropIcon className="text-[#7C3AED]" />
          </div>
          <div>
            <h1
              className="text-[26px] md:text-3xl text-[#251C35] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Cycle Tracker
            </h1>
            <p className="text-sm text-[#8A8299]">Log your cycle & get gentle AI insights</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Log Form */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6">
            <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">
              Log Your Cycle
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-[#251C35] font-medium mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-[#EFE9FB] rounded-xl text-sm text-[#251C35] focus:outline-none focus:ring-2 focus:ring-[#7C3AED33] focus:border-[#7C3AED]"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-[#251C35] font-medium mb-1.5">
                  End Date <span className="text-[#8A8299] font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  className="w-full p-3 border border-[#EFE9FB] rounded-xl text-sm text-[#251C35] focus:outline-none focus:ring-2 focus:ring-[#7C3AED33] focus:border-[#7C3AED]"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-[#251C35] font-medium mb-1.5">
                  Flow Intensity
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FLOW_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setFlow(opt.value)}
                      className={`py-2.5 rounded-xl text-sm font-medium border transition-colors ${
                        flow === opt.value
                          ? "bg-[#7C3AED] text-white border-[#7C3AED]"
                          : "bg-white text-[#8A8299] border-[#EFE9FB] hover:border-[#7C3AED66]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-[#251C35] font-medium mb-1.5">
                  Symptoms <span className="text-[#8A8299] font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="cramps, bloating, headache"
                  className="w-full p-3 border border-[#EFE9FB] rounded-xl text-sm text-[#251C35] placeholder:text-[#C4BDDB] focus:outline-none focus:ring-2 focus:ring-[#7C3AED33] focus:border-[#7C3AED]"
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#7C3AED] text-white p-3 rounded-xl font-medium hover:bg-[#6B21D8] transition-colors disabled:opacity-60"
              >
                {submitting ? "Saving..." : "Save Log"}
              </button>

              {message && (
                <p
                  className={`text-sm text-center ${
                    message.includes("wrong") ? "text-red-500" : "text-[#3F9142]"
                  }`}
                >
                  {message}
                </p>
              )}
            </form>
          </div>

          {/* AI Insight + History */}
          <div className="space-y-5 md:space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6 relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7C3AED] to-[#F2733F]" />
              <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-2 pl-2">
                AI Insight
              </p>
              {insightLoading ? (
                <div className="pl-2 space-y-2 animate-pulse">
                  <div className="h-3 bg-[#F1ECFB] rounded w-full" />
                  <div className="h-3 bg-[#F1ECFB] rounded w-4/5" />
                </div>
              ) : (
                <p
                  className="text-[#251C35] pl-2 leading-relaxed"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {insight}
                </p>
              )}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6">
              <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">
                Recent History
              </p>
              <ul className="space-y-2 max-h-72 overflow-y-auto">
                {history.map((log) => (
                  <li
                    key={log.id}
                    className="p-3.5 bg-[#FAF7FF] rounded-xl text-sm text-[#251C35] flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 shrink-0" />
                    <span>
                      <strong className="font-semibold">{log.start_date}</strong>{" "}
                      <span className="text-[#8A8299]">
                        — {log.flow_intensity || "N/A"} flow
                        {log.symptoms && <> · {log.symptoms}</>}
                      </span>
                    </span>
                  </li>
                ))}
                {history.length === 0 && (
                  <p className="text-[#C4BDDB] text-sm py-4 text-center">No logs yet.</p>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}