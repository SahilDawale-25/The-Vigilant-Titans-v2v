"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

const EXERCISE_OPTIONS = [
  { value: "none", label: "No exercise" },
  { value: "1-2/week", label: "1-2 times/week" },
  { value: "3-4/week", label: "3-4 times/week" },
  { value: "daily", label: "Daily" },
];

const NUTRITION_OPTIONS = [
  { value: "poor", label: "Poor nutrition" },
  { value: "average", label: "Average nutrition" },
  { value: "good", label: "Good nutrition" },
  { value: "excellent", label: "Excellent nutrition" },
];

const RISK_STYLES = {
  low: { bg: "#EEF7EF", text: "#2F7A3D", dot: "#3F9142" },
  moderate: { bg: "#FEF6E8", text: "#96660B", dot: "#E0A526" },
  high: { bg: "#FDECEB", text: "#B23A2E", dot: "#E24C3B" },
};

function TwinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <circle cx="8.5" cy="9" r="2.8" strokeWidth="1.7" />
      <circle cx="15.5" cy="9" r="2.8" strokeWidth="1.7" />
      <path d="M3.5 19c0-2.9 2.2-5.2 5-5.2s5 2.3 5 5.2M10.5 19c0-2.9 2.2-5.2 5-5.2s5 2.3 5 5.2" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-sm text-[#251C35] font-medium mb-1.5">{label}</label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full p-3 border border-[#EFE9FB] rounded-xl text-sm text-[#251C35] placeholder:text-[#C4BDDB] focus:outline-none focus:ring-2 focus:ring-[#7C3AED33] focus:border-[#7C3AED]";

export default function HealthTwinPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState({
    age: "",
    height_cm: "",
    weight_kg: "",
    avg_sleep_hours: "",
    avg_stress_level: 5,
    exercise_frequency: "1-2/week",
    nutrition_quality: "average",
    reported_symptoms: "",
  });
  const [result, setResult] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setGenerating(true);
    setError("");
    try {
      const data = await apiCall("/ai/health-twin/generate", {
        method: "POST",
        body: JSON.stringify({
          age: Number(form.age),
          height_cm: Number(form.height_cm),
          weight_kg: Number(form.weight_kg),
          avg_sleep_hours: Number(form.avg_sleep_hours),
          avg_stress_level: Number(form.avg_stress_level),
          exercise_frequency: form.exercise_frequency,
          nutrition_quality: form.nutrition_quality,
          reported_symptoms: form.reported_symptoms,
        }),
      });
      setResult(data);
    } catch (err) {
      setError("Could not generate Health Twin. Please check all fields.");
    } finally {
      setGenerating(false);
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
          <div className="w-11 h-11 rounded-2xl bg-[#2563EB1A] flex items-center justify-center shrink-0 text-[#2563EB]">
            <TwinIcon />
          </div>
          <div>
            <h1
              className="text-[26px] md:text-3xl text-[#251C35] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              AI Health Twin
            </h1>
            <p className="text-sm text-[#8A8299]">Your personalized wellness profile, powered by AI</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Input Form */}
          <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6">
            <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">
              Update Your Profile
            </p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Age">
                  <input type="number" placeholder="28" className={inputClass}
                    value={form.age} onChange={(e) => handleChange("age", e.target.value)} required />
                </Field>
                <Field label="Height (cm)">
                  <input type="number" placeholder="165" className={inputClass}
                    value={form.height_cm} onChange={(e) => handleChange("height_cm", e.target.value)} required />
                </Field>
                <Field label="Weight (kg)">
                  <input type="number" placeholder="60" className={inputClass}
                    value={form.weight_kg} onChange={(e) => handleChange("weight_kg", e.target.value)} required />
                </Field>
                <Field label="Avg sleep (hrs)">
                  <input type="number" step="0.5" placeholder="7" className={inputClass}
                    value={form.avg_sleep_hours} onChange={(e) => handleChange("avg_sleep_hours", e.target.value)} required />
                </Field>
              </div>

              <div>
                <label className="flex items-center justify-between text-sm text-[#251C35] font-medium mb-2">
                  <span>Stress Level</span>
                  <span className="text-[#7C3AED] font-semibold">{form.avg_stress_level}/10</span>
                </label>
                <input
                  type="range" min="1" max="10" value={form.avg_stress_level}
                  onChange={(e) => handleChange("avg_stress_level", e.target.value)}
                  className="w-full accent-[#7C3AED]"
                />
              </div>

              <Field label="Exercise Frequency">
                <select className={inputClass + " bg-white"} value={form.exercise_frequency}
                  onChange={(e) => handleChange("exercise_frequency", e.target.value)}>
                  {EXERCISE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label="Nutrition Quality">
                <select className={inputClass + " bg-white"} value={form.nutrition_quality}
                  onChange={(e) => handleChange("nutrition_quality", e.target.value)}>
                  {NUTRITION_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </Field>

              <Field label={<>Symptoms <span className="text-[#8A8299] font-normal">(optional)</span></>}>
                <input type="text" placeholder="fatigue, headaches"
                  className={inputClass}
                  value={form.reported_symptoms} onChange={(e) => handleChange("reported_symptoms", e.target.value)} />
              </Field>

              <button type="submit" disabled={generating}
                className="w-full bg-[#7C3AED] text-white p-3 rounded-xl font-medium hover:bg-[#6B21D8] transition-colors disabled:opacity-60">
                {generating ? "Generating..." : "Generate My Health Twin"}
              </button>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </form>
          </div>

          {/* Results */}
          {result ? (
            <div className="space-y-5 md:space-y-6">
              <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-6 text-center">
                <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-2">
                  Wellness Score
                </p>
                <p
                  className="text-5xl text-[#251C35]"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {result.wellness_score}
                </p>
                <p className="text-xs text-[#8A8299] mt-2">BMI: {result.bmi}</p>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6">
                <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">
                  Risk Trends
                </p>
                <div className="space-y-2">
                  {result.risk_trends.map((trend, i) => {
                    const style = RISK_STYLES[trend.level] || { bg: "#F7F7F7", text: "#555", dot: "#999" };
                    return (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl text-sm flex items-start gap-2.5"
                        style={{ backgroundColor: style.bg, color: style.text }}
                      >
                        <span
                          className="w-2 h-2 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: style.dot }}
                        />
                        <span>
                          <strong className="font-semibold">{trend.category}:</strong> {trend.trend}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6 relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7C3AED] to-[#F2733F]" />
                <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-2 pl-2">
                  AI Insight
                </p>
                <p
                  className="text-[#251C35] pl-2 leading-relaxed"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {result.ai_insight}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-8 flex flex-col items-center justify-center text-center min-h-[240px]">
              <div className="w-11 h-11 rounded-2xl bg-[#2563EB1A] flex items-center justify-center mb-3 text-[#2563EB]">
                <TwinIcon />
              </div>
              <p className="text-[#8A8299] text-sm">
                Fill in your profile to generate your personalized Health Twin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}