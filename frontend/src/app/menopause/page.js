"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

const COMMON_SYMPTOMS = ["hot_flashes", "mood_swings", "insomnia", "night_sweats", "joint_pain", "fatigue"];

function LeafIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M4 20c8-1 14-7 15-15-8 1-14 7-15 15Z" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M9 15c2-2 4.5-4.5 7-7" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function BoneIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path
        d="M6.5 6.5a2.3 2.3 0 1 0-3.2 3.2c-1 1-1 3.6 1 4.6-1 1.4-.6 3.2.8 4a2.3 2.3 0 1 0 3.2 3.2l7.4-7.4a2.3 2.3 0 1 0 3.2-3.2c1-1 1-3.6-1-4.6 1-1.4.6-3.2-.8-4a2.3 2.3 0 1 0-3.2-3.2Z"
        strokeWidth="1.5" strokeLinejoin="round"
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

export default function MenopausePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadHistory();
      loadRecommendations();
    }
  }, [user]);

  async function loadHistory() {
    try {
      const data = await apiCall("/menopause/history");
      setHistory(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadRecommendations() {
    try {
      const data = await apiCall("/menopause/recommendations");
      setRecommendations(data);
    } catch (err) {
      console.error(err);
    }
  }

  function toggleSymptom(symptom) {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await apiCall("/menopause/symptom-log", {
        method: "POST",
        body: JSON.stringify({
          symptoms: selectedSymptoms.join(","),
          severity: Number(severity),
        }),
      });
      setMessage("Symptoms logged!");
      setSelectedSymptoms([]);
      loadHistory();
    } catch (err) {
      setMessage("Error logging symptoms");
    } finally {
      setSaving(false);
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
          <div className="w-11 h-11 rounded-2xl bg-[#F2733F1A] flex items-center justify-center shrink-0 text-[#F2733F]">
            <LeafIcon />
          </div>
          <div>
            <h1
              className="text-[26px] md:text-3xl text-[#251C35] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Menopause Support
            </h1>
            <p className="text-sm text-[#8A8299]">Track symptoms & get gentle guidance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Symptom Logger */}
          <SectionCard title="Log Today's Symptoms">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {COMMON_SYMPTOMS.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      type="button"
                      key={symptom}
                      onClick={() => toggleSymptom(symptom)}
                      className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
                        active
                          ? "bg-[#F2733F] text-white border-[#F2733F]"
                          : "bg-white text-[#8A8299] border-[#EFE9FB] hover:border-[#F2733F66]"
                      }`}
                    >
                      {symptom.replace("_", " ")}
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="flex items-center justify-between text-sm text-[#251C35] font-medium mb-2">
                  <span>Severity</span>
                  <span className="text-[#F2733F] font-semibold">{severity}/10</span>
                </label>
                <input
                  type="range" min="1" max="10"
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full accent-[#F2733F]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-[#F2733F] text-white p-3 rounded-xl font-medium hover:bg-[#DE6330] transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Log"}
              </button>

              {message && (
                <p className={`text-sm text-center ${message.includes("Error") ? "text-red-500" : "text-[#3F9142]"}`}>
                  {message}
                </p>
              )}
            </form>
          </SectionCard>

          {/* History */}
          <SectionCard title="Recent History">
            <ul className="space-y-2 max-h-72 overflow-y-auto">
              {history.map((log) => (
                <li
                  key={log.id}
                  className="p-3.5 bg-[#FAF7FF] rounded-xl text-sm text-[#251C35] flex items-start gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F2733F] mt-1.5 shrink-0" />
                  <span>
                    <strong className="font-semibold">{log.date}</strong>{" "}
                    <span className="text-[#8A8299]">
                      — Severity: {log.severity}/10
                      {log.symptoms && <> · {log.symptoms.replace(/,/g, ", ").replace(/_/g, " ")}</>}
                    </span>
                  </span>
                </li>
              ))}
              {history.length === 0 && (
                <p className="text-[#C4BDDB] text-sm py-4 text-center">No logs yet.</p>
              )}
            </ul>
          </SectionCard>

          {recommendations && (
            <>
              {/* Lifestyle */}
              <SectionCard title="Lifestyle Tips">
                <ul className="space-y-2.5">
                  {recommendations.lifestyle_tips.map((tip, i) => (
                    <li key={i} className="text-sm text-[#251C35] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </SectionCard>

              {/* Diet */}
              <SectionCard title="Diet Recommendations">
                <ul className="space-y-2.5">
                  {recommendations.diet_recommendations.map((tip, i) => (
                    <li key={i} className="text-sm text-[#251C35] flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#3F9142] mt-1.5 shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </SectionCard>

              {/* Exercise Plans */}
              <SectionCard title="Exercise Plans" className="md:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {recommendations.exercise_plans.map((plan, i) => (
                    <div key={i} className="p-4 bg-[#FAF7FF] rounded-2xl border border-[#F1ECFB]">
                      <p className="font-semibold text-[#251C35]" style={{ fontFamily: "'Fraunces', serif" }}>
                        {plan.name}
                      </p>
                      <p className="text-xs text-[#8A8299] mt-1">{plan.duration}</p>
                      <p className="text-xs text-[#8A8299]">{plan.focus}</p>
                    </div>
                  ))}
                </div>
              </SectionCard>

              {/* Bone Health */}
              <SectionCard title="Bone Health Awareness" className="md:col-span-2">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#2563EB1A] flex items-center justify-center shrink-0 text-[#2563EB] mt-0.5">
                    <BoneIcon />
                  </div>
                  <p className="text-sm text-[#251C35] leading-relaxed">{recommendations.bone_health_info}</p>
                </div>
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </div>
  );
}