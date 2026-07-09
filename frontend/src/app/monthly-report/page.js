"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../lib/firebase";

export default function MonthlyReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  async function handleDownload() {
    setDownloading(true);
    setError("");
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch("http://localhost:8000/reports/monthly/download", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to generate report");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "HerWellness_Monthly_Report.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      setError("Could not generate report. Try logging some data first.");
    } finally {
      setDownloading(false);
    }
  }

  if (loading || !user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-purple-50 p-8 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-md p-10 max-w-md text-center">
        <p className="text-5xl mb-4">📄</p>
        <h1 className="text-2xl font-bold text-purple-800 mb-2">Monthly Health Report</h1>
        <p className="text-gray-500 mb-6">
          Get a personalized, downloadable summary of your cycle, mood, and wellness trends —
          ready to share with your doctor.
        </p>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {downloading ? "Generating..." : "Download Report"}
        </button>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}