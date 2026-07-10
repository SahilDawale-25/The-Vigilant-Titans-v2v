"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../lib/firebase";

function DocIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M7 3.5h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M14 3.5v4h4M9 12h6M9 15.5h6M9 8.5h2.5" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M12 15V4M8 8l4-4 4 4M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionCard({ title, children, className = "" }) {
  return (
    <div className={`bg-white rounded-3xl shadow-sm border border-[#F1ECFB] p-5 md:p-6 ${className}`}>
      <p className="text-[11px] uppercase tracking-wide text-[#8A8299] mb-4">{title}</p>
      {children}
    </div>
  );
}

export default function ReportAnalyzerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  function handleFileSelect(selected) {
    if (selected && selected.type === "application/pdf") {
      setFile(selected);
      setError("");
    } else if (selected) {
      setError("Please select a PDF file.");
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files[0]);
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) return;
    setAnalyzing(true);
    setError("");
    setSummary("");

    try {
      const token = await auth.currentUser.getIdToken();
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:8000/ai/report-analyzer/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      setSummary(data.ai_summary);
    } catch (err) {
      setError("Could not analyze the report. Please make sure it's a text-based PDF.");
    } finally {
      setAnalyzing(false);
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
            <DocIcon />
          </div>
          <div>
            <h1
              className="text-[26px] md:text-3xl text-[#251C35] leading-tight"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              AI Report Analyzer
            </h1>
            <p className="text-sm text-[#8A8299]">
              Upload a blood report, prescription, or lab report for a simple explanation
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Upload Form */}
          <SectionCard title="Upload Report (PDF)">
            <form onSubmit={handleUpload} className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className={`rounded-2xl border-2 border-dashed p-6 md:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
                  file ? "border-[#7C3AED] bg-[#7C3AED0D]" : "border-[#EFE9FB] hover:border-[#7C3AED66]"
                }`}
              >
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${file ? "bg-[#7C3AED1A] text-[#7C3AED]" : "bg-[#FAF7FF] text-[#8A8299]"}`}>
                  {file ? <DocIcon /> : <UploadIcon />}
                </div>
                {file ? (
                  <>
                    <p className="text-sm font-medium text-[#251C35] break-all">{file.name}</p>
                    <p className="text-xs text-[#8A8299] mt-1">Tap to choose a different file</p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-medium text-[#251C35]">Tap to upload or drag & drop</p>
                    <p className="text-xs text-[#8A8299] mt-1">PDF files only</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
              </div>

              <button
                type="submit"
                disabled={analyzing || !file}
                className="w-full bg-[#7C3AED] text-white p-3 rounded-xl font-medium hover:bg-[#6B21D8] transition-colors disabled:opacity-50"
              >
                {analyzing ? "Analyzing..." : "Analyze Report"}
              </button>
              {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            </form>
          </SectionCard>

          {/* AI Summary */}
          <SectionCard title="AI Explanation" className="relative overflow-hidden">
            {summary && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7C3AED] to-[#F2733F]" />}
            {analyzing ? (
              <div className="space-y-2.5 animate-pulse pl-1">
                <div className="h-3 bg-[#F1ECFB] rounded w-full" />
                <div className="h-3 bg-[#F1ECFB] rounded w-11/12" />
                <div className="h-3 bg-[#F1ECFB] rounded w-4/5" />
                <div className="h-3 bg-[#F1ECFB] rounded w-full mt-4" />
                <div className="h-3 bg-[#F1ECFB] rounded w-3/4" />
              </div>
            ) : summary ? (
              <p
                className="text-[#251C35] whitespace-pre-line leading-relaxed pl-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {summary}
              </p>
            ) : (
              <div className="py-8 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-[#FAF7FF] flex items-center justify-center mb-2 text-[#C4BDDB]">
                  <DocIcon />
                </div>
                <p className="text-sm text-[#C4BDDB]">Upload a report to see the explanation here.</p>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}