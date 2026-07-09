"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

export default function CycleTrackerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [flow, setFlow] = useState("medium");
  const [symptoms, setSymptoms] = useState("");
  const [history, setHistory] = useState([]);
  const [insight, setInsight] = useState("");
  const [message, setMessage] = useState("");

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
    try {
      const data = await apiCall("/cycle/insight");
      setInsight(data.insight);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
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
    }
  }

  if (loading || !user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-purple-50 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-purple-800 mb-6">Cycle Tracker</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Log Form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Log Your Cycle</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Start Date</label>
              <input
                type="date"
                className="w-full p-3 border rounded-lg"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">End Date (optional)</label>
              <input
                type="date"
                className="w-full p-3 border rounded-lg"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Flow Intensity</label>
              <select
                className="w-full p-3 border rounded-lg"
                value={flow}
                onChange={(e) => setFlow(e.target.value)}
              >
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">Symptoms (comma-separated)</label>
              <input
                type="text"
                placeholder="cramps, bloating, headache"
                className="w-full p-3 border rounded-lg"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700"
            >
              Save Log
            </button>
            {message && <p className="text-sm text-purple-600">{message}</p>}
          </form>
        </div>

        {/* AI Insight + History */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-2 text-gray-700">AI Insight</h2>
            <p className="text-gray-600">{insight || "Loading insight..."}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Recent History</h2>
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {history.map((log) => (
                <li key={log.id} className="p-3 bg-purple-50 rounded-lg text-sm text-gray-700">
                  <strong>{log.start_date}</strong> — {log.flow_intensity || "N/A"} flow
                  {log.symptoms && <> · {log.symptoms}</>}
                </li>
              ))}
              {history.length === 0 && <p className="text-gray-400 text-sm">No logs yet.</p>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}