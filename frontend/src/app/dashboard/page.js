"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { apiCall } from "../../lib/api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result = await apiCall("/dashboard/summary");
        setData(result);
      } catch (err) {
        setError("Could not load dashboard data");
      }
    }
    if (user) fetchDashboard();
  }, [user]);

  if (loading || !user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-purple-50 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-purple-800 mb-6">
        Welcome back, {user.email}
      </h1>

      {error && <p className="text-red-500">{error}</p>}

      {data && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Wellness Score Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center">
            <p className="text-gray-500 mb-2">Wellness Score</p>
            <p className="text-5xl font-bold text-purple-600">{data.wellness_score}</p>
            <p className="text-gray-400 text-sm mt-2">out of 100</p>
          </div>

          {/* Recommendation Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:col-span-2">
            <p className="text-gray-500 mb-2">AI Recommendation</p>
            <p className="text-lg text-gray-800">{data.recommendation}</p>
          </div>

          {/* Trend Chart */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:col-span-3">
            <p className="text-gray-500 mb-4">Weekly Trends</p>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.trend_data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="mood" stroke="#a855f7" strokeWidth={2} />
                <Line type="monotone" dataKey="sleep" stroke="#38bdf8" strokeWidth={2} />
                <Line type="monotone" dataKey="stress" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Reminders Card */}
          <div className="bg-white rounded-2xl shadow-md p-6 md:col-span-3">
            <p className="text-gray-500 mb-4">Upcoming Reminders</p>
            <ul className="space-y-2">
              {data.upcoming_reminders.map((r, i) => (
                <li key={i} className="p-3 bg-purple-50 rounded-lg text-gray-700">
                  {r.title}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}