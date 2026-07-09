"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

const COMMON_SYMPTOMS = ["hot_flashes", "mood_swings", "insomnia", "night_sweats", "joint_pain", "fatigue"];

export default function MenopausePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [severity, setSeverity] = useState(5);
  const [history, setHistory] = useState([]);
  const [recommendations, setRecommendations] = useState(null);
  const [message, setMessage] = useState("");

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
    }
  }

  if (loading || !user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-amber-50 p-8">
      <h1 className="text-3xl font-bold text-amber-800 mb-6">Menopause Support</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Symptom Logger */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Log Today's Symptoms</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map((symptom) => (
                <button
                  type="button"
                  key={symptom}
                  onClick={() => toggleSymptom(symptom)}
                  className={`px-3 py-2 rounded-full text-sm ${
                    selectedSymptoms.includes(symptom)
                      ? "bg-amber-600 text-white"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {symptom.replace("_", " ")}
                </button>
              ))}
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Severity (1-10): {severity}</label>
              <input
                type="range" min="1" max="10"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full"
              />
            </div>
            <button type="submit" className="w-full bg-amber-600 text-white p-3 rounded-lg hover:bg-amber-700">
              Save Log
            </button>
            {message && <p className="text-sm text-amber-600">{message}</p>}
          </form>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Recent History</h2>
          <ul className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((log) => (
              <li key={log.id} className="p-3 bg-amber-50 rounded-lg text-sm text-gray-700">
                <strong>{log.date}</strong> — Severity: {log.severity}/10
                {log.symptoms && <> · {log.symptoms.replace(/,/g, ", ").replace(/_/g, " ")}</>}
              </li>
            ))}
            {history.length === 0 && <p className="text-gray-400 text-sm">No logs yet.</p>}
          </ul>
        </div>

        {recommendations && (
          <>
            {/* Lifestyle + Diet */}
            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Lifestyle Tips</h2>
              <ul className="space-y-1">
                {recommendations.lifestyle_tips.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-700">• {tip}</li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Diet Recommendations</h2>
              <ul className="space-y-1">
                {recommendations.diet_recommendations.map((tip, i) => (
                  <li key={i} className="text-sm text-gray-700">• {tip}</li>
                ))}
              </ul>
            </div>

            {/* Exercise Plans */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:col-span-2">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">Exercise Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {recommendations.exercise_plans.map((plan, i) => (
                  <div key={i} className="p-4 bg-amber-50 rounded-lg">
                    <p className="font-semibold text-amber-800">{plan.name}</p>
                    <p className="text-xs text-gray-500">{plan.duration}</p>
                    <p className="text-xs text-gray-500">{plan.focus}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bone Health */}
            <div className="bg-white rounded-2xl shadow-md p-6 md:col-span-2">
              <h2 className="text-lg font-semibold mb-3 text-gray-700">🦴 Bone Health Awareness</h2>
              <p className="text-sm text-gray-700">{recommendations.bone_health_info}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}