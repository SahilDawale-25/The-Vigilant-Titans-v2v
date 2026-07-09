"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

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

  if (loading || !user) return <div className="p-10">Loading...</div>;

  const riskColor = {
    low: "bg-green-50 text-green-700",
    moderate: "bg-yellow-50 text-yellow-700",
    high: "bg-red-50 text-red-700",
  };

  return (
    <div className="min-h-screen bg-purple-50 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-purple-800 mb-2">AI Health Twin</h1>
      <p className="text-gray-500 mb-6">Your personalized wellness profile, powered by AI.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Update Your Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input type="number" placeholder="Age" className="p-3 border rounded-lg"
                value={form.age} onChange={(e) => handleChange("age", e.target.value)} required />
              <input type="number" placeholder="Height (cm)" className="p-3 border rounded-lg"
                value={form.height_cm} onChange={(e) => handleChange("height_cm", e.target.value)} required />
              <input type="number" placeholder="Weight (kg)" className="p-3 border rounded-lg"
                value={form.weight_kg} onChange={(e) => handleChange("weight_kg", e.target.value)} required />
              <input type="number" step="0.5" placeholder="Avg sleep hours" className="p-3 border rounded-lg"
                value={form.avg_sleep_hours} onChange={(e) => handleChange("avg_sleep_hours", e.target.value)} required />
            </div>

            <div>
              <label className="block text-sm text-gray-500 mb-1">Stress Level (1-10): {form.avg_stress_level}</label>
              <input type="range" min="1" max="10" value={form.avg_stress_level}
                onChange={(e) => handleChange("avg_stress_level", e.target.value)} className="w-full" />
            </div>

            <select className="w-full p-3 border rounded-lg" value={form.exercise_frequency}
              onChange={(e) => handleChange("exercise_frequency", e.target.value)}>
              <option value="none">No exercise</option>
              <option value="1-2/week">1-2 times/week</option>
              <option value="3-4/week">3-4 times/week</option>
              <option value="daily">Daily</option>
            </select>

            <select className="w-full p-3 border rounded-lg" value={form.nutrition_quality}
              onChange={(e) => handleChange("nutrition_quality", e.target.value)}>
              <option value="poor">Poor nutrition</option>
              <option value="average">Average nutrition</option>
              <option value="good">Good nutrition</option>
              <option value="excellent">Excellent nutrition</option>
            </select>

            <input type="text" placeholder="Any symptoms (comma-separated, optional)"
              className="w-full p-3 border rounded-lg"
              value={form.reported_symptoms} onChange={(e) => handleChange("reported_symptoms", e.target.value)} />

            <button type="submit" disabled={generating}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {generating ? "Generating..." : "Generate My Health Twin"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-md p-6 text-center">
              <p className="text-gray-500 mb-1">Wellness Score</p>
              <p className="text-5xl font-bold text-purple-600">{result.wellness_score}</p>
              <p className="text-xs text-gray-400 mt-1">BMI: {result.bmi}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-700 mb-3">Risk Trends</h3>
              <div className="space-y-2">
                {result.risk_trends.map((trend, i) => (
                  <div key={i} className={`p-3 rounded-lg text-sm ${riskColor[trend.level] || "bg-gray-50"}`}>
                    <strong>{trend.category}:</strong> {trend.trend}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h3 className="font-semibold text-gray-700 mb-2">AI Insight</h3>
              <p className="text-sm text-gray-700">{result.ai_insight}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}