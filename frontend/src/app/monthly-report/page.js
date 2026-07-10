"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../lib/firebase";

function ReportIcon() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M14 3.5v4h4M9 12h6M9 15.5h6M9 8.5h2.5" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 4v11M8 11l4 4 4-4M4 17v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MonthlyReportPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  async function handleDownload() {
    setDownloading(true);
    setError("");
    setDone(false);
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
      setDone(true);
    } catch (err) {
      setError("Could not generate report. Try logging some data first.");
    } finally {
      setDownloading(false);
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
    <div className="min-h-screen bg-[#FAF7FF] flex items-center justify-center px-4 py-10">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>

      <div
        className="bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-8 md:p-10 max-w-md w-full text-center relative overflow-hidden"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#7C3AED] to-[#F2733F]" />

        <div className="w-16 h-16 rounded-2xl bg-[#7C3AED1A] flex items-center justify-center text-[#7C3AED] mx-auto mb-5">
          <ReportIcon />
        </div>

        <h1
          className="text-2xl md:text-[26px] text-[#251C35] mb-3"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Monthly Health Report
        </h1>
        <p className="text-sm text-[#8A8299] leading-relaxed mb-7">
          Get a personalized, downloadable summary of your cycle, mood, and wellness trends —
          ready to share with your doctor.
        </p>

        <button
          onClick={handleDownload}
          disabled={downloading}
          className="w-full bg-[#7C3AED] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#6B21D8] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {downloading ? (
            "Generating..."
          ) : (
            <>
              <DownloadIcon />
              Download Report
            </>
          )}
        </button>

        {done && !error && (
          <p className="text-[#3F9142] text-sm mt-4">Report downloaded successfully!</p>
        )}
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}