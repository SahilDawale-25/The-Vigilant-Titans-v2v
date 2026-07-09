"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";

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
    try {
      await apiCall("/pregnancy/profile", {
        method: "POST",
        body: JSON.stringify({ due_date: dueDate }),
      });
      setMessage("Due date saved!");
      loadWeekInfo();
    } catch (err) {
      setMessage("Error saving due date");
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

  if (loading || !user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-pink-50 p-8">
      <h1 className="text-3xl font-bold text-pink-800 mb-6">Pregnancy Companion</h1>

      {!weekInfo && (
        <div className="bg-white rounded-2xl shadow-md p-6 max-w-md mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Set Your Due Date</h2>
          <form onSubmit={handleDueDateSubmit} className="space-y-4">
            <input
              type="date"
              className="w-full p-3 border rounded-lg"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              required
            />
            <button type="submit" className="w-full bg-pink-600 text-white p-3 rounded-lg hover:bg-pink-700">
              Save
            </button>
          </form>
          {message && <p className="text-sm text-pink-600 mt-2">{message}</p>}
        </div>
      )}

      {weekInfo && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Week Info Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Week {weekInfo.current_week}</h2>
            <p className="text-4xl mb-2">🍼</p>
            <p className="text-gray-600 mb-2">
              Your baby is about the size of a <strong>{weekInfo.baby_size}</strong> ({weekInfo.baby_size_cm} cm)
            </p>
            <p className="text-gray-700 mb-3">{weekInfo.development}</p>
            <div className="bg-pink-50 p-3 rounded-lg text-sm text-pink-700">💡 {weekInfo.tip}</div>
          </div>

          {/* Medicine Reminders */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-700">Medicine Reminders</h2>
            <form onSubmit={handleReminderSubmit} className="space-y-3 mb-4">
              <input
                type="text"
                placeholder="Medicine name"
                className="w-full p-2 border rounded-lg"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                required
              />
              <select
                className="w-full p-2 border rounded-lg"
                value={timeOfDay}
                onChange={(e) => setTimeOfDay(e.target.value)}
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="night">Night</option>
              </select>
              <button type="submit" className="w-full bg-pink-600 text-white p-2 rounded-lg hover:bg-pink-700">
                Add Reminder
              </button>
            </form>
            <ul className="space-y-2">
              {reminders.map((r) => (
                <li key={r.id} className="p-2 bg-pink-50 rounded-lg text-sm text-gray-700">
                  {r.medicine_name} — {r.time_of_day}
                </li>
              ))}
            </ul>
          </div>

          {/* Emergency Checklist */}
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4 text-red-600">⚠️ Seek Immediate Care If:</h2>
            <ul className="space-y-2">
              {emergencySymptoms.map((s, i) => (
                <li key={i} className="text-sm text-gray-700">• {s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}