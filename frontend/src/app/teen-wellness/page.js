"use client";
import { useEffect, useState } from "react";

export default function TeenWellnessPage() {
  const [items, setItems] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [question, setQuestion] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMythsFacts();
  }, []);

  async function loadMythsFacts() {
    try {
      const res = await fetch("http://localhost:8000/teen/myths-facts");
      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      console.error(err);
    }
  }

  function toggleFlip(id) {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  async function handleAskQuestion(e) {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setChatHistory((prev) => [...prev, { role: "user", text: userQuestion }]);
    setQuestion("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/teen/anonymous-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userQuestion }),
      });
      const data = await res.json();
      setChatHistory((prev) => [...prev, { role: "ai", text: data.answer }]);
    } catch (err) {
      setChatHistory((prev) => [...prev, { role: "ai", text: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-2">Teen Wellness</h1>
      <p className="text-gray-500 mb-6">A safe, judgment-free space to learn and ask questions.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Myth vs Fact Cards */}
        <div>
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Myth vs Fact</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleFlip(item.id)}
                className="bg-white rounded-2xl shadow-md p-5 cursor-pointer hover:shadow-lg transition"
              >
                {!flipped[item.id] ? (
                  <p className="text-gray-700">
                    <span className="font-bold text-red-500">Myth: </span>
                    {item.myth}
                  </p>
                ) : (
                  <p className="text-gray-700">
                    <span className="font-bold text-green-600">Fact: </span>
                    {item.fact}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">Tap to {flipped[item.id] ? "see myth" : "reveal fact"}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Anonymous Chat */}
        <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col h-[600px]">
          <h2 className="text-lg font-semibold text-gray-700 mb-2">Anonymous Q&A</h2>
          <p className="text-xs text-gray-400 mb-4">No sign-in needed. Your questions stay private.</p>

          <div className="flex-1 overflow-y-auto space-y-3 mb-4">
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg text-sm max-w-[85%] ${
                  msg.role === "user"
                    ? "bg-blue-100 ml-auto text-blue-900"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {loading && <div className="text-sm text-gray-400">Thinking...</div>}
          </div>

          <form onSubmit={handleAskQuestion} className="flex gap-2">
            <input
              type="text"
              placeholder="Ask anything..."
              className="flex-1 p-3 border rounded-lg"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button type="submit" className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700">
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}