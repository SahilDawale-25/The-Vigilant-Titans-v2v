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

export default function MentalWellnessPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [stressRating, setStressRating] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [burnout, setBurnout] = useState(null);
  const [message, setMessage] = useState("");

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
    }
  }

  if (loading || !user) return <div className="p-10">Loading...</div>;

  const riskColor = {
    low: "text-green-600 bg-green-50",
    moderate: "text-yellow-600 bg-yellow-50",
    high: "text-red-600 bg-red-50",
    unknown: "text-gray-500 bg-gray-50",
  };

  return (
    <div className="min-h-screen bg-purple-50 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-purple-800 mb-6">Mental Wellness</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mood Logger */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">How are you feeling today?</h2>
          <div className="flex justify-between">
            {MOODS.map((mood) => (
              <button
                key={mood.label}
                onClick={() => handleMoodClick(mood)}
                className="flex flex-col items-center hover:scale-110 transition"
              >
                <span className="text-4xl">{mood.emoji}</span>
                <span className="text-xs text-gray-500 mt-1">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Stress + Sleep Logger */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Log Stress & Sleep</h2>
          <form onSubmit={handleStressSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Stress Level (1-10): {stressRating}</label>
              <input
                type="range"
                min="1"
                max="10"
                value={stressRating}
                onChange={(e) => setStressRating(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Sleep Hours: {sleepHours}</label>
              <input
                type="range"
                min="0"
                max="12"
                step="0.5"
                value={sleepHours}
                onChange={(e) => setSleepHours(e.target.value)}
                className="w-full"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
            >
              Save
            </button>
          </form>
        </div>

        {/* Burnout Score */}
        {burnout && (
          <div className={`rounded-2xl shadow-md p-6 md:col-span-2 ${riskColor[burnout.risk_level]}`}>
            <h2 className="text-lg font-semibold mb-2">Burnout Risk Score</h2>
            <p className="text-4xl font-bold mb-2">{burnout.burnout_score}/100</p>
            <p className="text-sm">{burnout.message}</p>
          </div>
        )}

        {message && <p className="text-sm text-purple-600 md:col-span-2">{message}</p>}
      </div>
    </div>
  );
}