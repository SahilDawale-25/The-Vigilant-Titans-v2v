"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

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

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadVaccineSchedule();
      loadTips();
    }
  }, [user]);

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
    try {
      await apiCall("/newmother/baby-profile", {
        method: "POST",
        body: JSON.stringify({ baby_name: babyName, date_of_birth: dob }),
      });
      setMessage("Baby profile saved!");
      loadVaccineSchedule();
    } catch (err) {
      setMessage("Error saving profile");
    }
  }

  async function handleMoodSubmit(e) {
    e.preventDefault();
    try {
      const result = await apiCall("/newmother/mood-log", {
        method: "POST",
        body: JSON.stringify({ mood_score: Number(moodScore), sleep_hours: Number(sleepHours) }),
      });
      setMessage("Mood logged!");
      if (result.supportive_message) setSupportMessage(result.supportive_message);
    } catch (err) {
      setMessage("Error logging mood");
    }
  }

  if (loading || !user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-rose-50 p-8">
      <h1 className="text-3xl font-bold text-rose-800 mb-6">New Mother Care</h1>

      {!vaccineData && (
        <div className="bg-white rounded-2xl shadow-md p-6 max-w-md mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Add Baby's Details</h2>
          <form onSubmit={handleBabyProfileSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Baby's name"
              className="w-full p-3 border rounded-lg"
              value={babyName}
              onChange={(e) => setBabyName(e.target.value)}
              required
            />
            <input
              type="date"
              className="w-full p-3 border rounded-lg"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-rose-600 text-white p-3 rounded-lg hover:bg-rose-700">
              Save
            </button>
          </form>
        </div>
      )}

      {vaccineData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Vaccination Schedule */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">
              {vaccineData.baby_name}'s Vaccination Schedule
            </h2>
            <ul className="space-y-2 max-h-80 overflow-y-auto">
              {vaccineData.schedule.map((item, i) => (
                <li
                  key={i}
                  className={`p-3 rounded-lg text-sm ${
                    item.status === "due_or_completed" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-600"
                  }`}
                >
                  <strong>{item.vaccine}</strong>
                  <br />Due: {item.due_date}
                </li>
              ))}
            </ul>
          </div>

          {/* Breastfeeding Tips */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Breastfeeding Guidance</h2>
            <ul className="space-y-2">
              {tips.map((tip, i) => (
                <li key={i} className="text-sm text-gray-700">• {tip}</li>
              ))}
            </ul>
          </div>

          {/* Postpartum Mood Log */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:col-span-2">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">How are you feeling today?</h2>
            <form onSubmit={handleMoodSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Mood (1-10): {moodScore}</label>
                <input
                  type="range" min="1" max="10"
                  value={moodScore}
                  onChange={(e) => setMoodScore(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Sleep Hours: {sleepHours}</label>
                <input
                  type="range" min="0" max="12" step="0.5"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-full"
                />
              </div>
              <button type="submit" className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700">
                Log Mood
              </button>
            </form>
            {message && <p className="text-sm text-rose-600 mt-3">{message}</p>}
            {supportMessage && (
              <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-sm">
                💛 {supportMessage}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}