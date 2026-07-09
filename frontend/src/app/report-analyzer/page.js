"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import { auth } from "../../lib/firebase";

export default function ReportAnalyzerPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

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

  if (loading || !user) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-purple-50 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-purple-800 mb-2">AI Report Analyzer</h1>
      <p className="text-gray-500 mb-6">Upload a blood report, prescription, or lab report to get a simple explanation.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">Upload Report (PDF)</h2>
          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="file"
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full p-3 border rounded-lg"
              required
            />
            <button
              type="submit"
              disabled={analyzing}
              className="w-full bg-purple-600 text-white p-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {analyzing ? "Analyzing..." : "Analyze Report"}
            </button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>

        {/* AI Summary */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">AI Explanation</h2>
          {summary ? (
            <p className="text-sm text-gray-700 whitespace-pre-line">{summary}</p>
          ) : (
            <p className="text-sm text-gray-400">Upload a report to see the explanation here.</p>
          )}
        </div>
      </div>
    </div>
  );
}