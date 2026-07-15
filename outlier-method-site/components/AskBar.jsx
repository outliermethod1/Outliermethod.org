"use client";
import { useState } from "react";

const HINTS = ["Public land near me?", "Best wool jacket under $100?"];

export default function AskBar() {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function ask() {
    const question = q.trim();
    if (!question || loading) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      setAnswer(data.answer || "Amos went quiet. Try again.");
    } catch {
      setAnswer("Amos is out of radio range. Try again in a minute.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ask-amos">
      <div className="ask-inner">
        <div className="avatar avatar-amos avatar-sm">
          <img src="/amos.png" alt="Amos Flint" onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <span className="avatar-fallback">AF</span>
        </div>
        <div className="ask-box">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder={'Ask Amos anything… "Can I start fly fishing for $200?"'}
          />
          <button onClick={ask}>{loading ? "…" : "Ask Amos"}</button>
        </div>
        <div className="ask-hints">
          {HINTS.map((h) => (
            <span key={h} onClick={() => setQ(h)}>
              {h}
            </span>
          ))}
        </div>
      </div>
      {answer && (
        <div className="ask-answer">
          <div className="avatar avatar-amos avatar-xs">
            <img src="/amos.png" alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <span className="avatar-fallback">AF</span>
          </div>
          <span>Amos: {answer}</span>
        </div>
      )}
    </div>
  );
}
