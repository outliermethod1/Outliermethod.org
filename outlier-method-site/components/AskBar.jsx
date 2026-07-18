"use client";
import { useEffect, useState } from "react";

const HINTS = ["Public land near me?", "Best wool jacket under $100?"];

const PERSONAS = {
  amos: {
    label: "Amos",
    avatarClass: "avatar-amos",
    img: "/amos.png",
    alt: "Amos Flint",
    fallback: "AF",
    placeholder: 'Ask Amos anything… "Can I start fly fishing for $200?"',
    idleAnswer: "Amos went quiet. Try again.",
    errorAnswer: "Amos is out of radio range. Try again in a minute.",
  },
  eleanor: {
    label: "Eleanor",
    avatarClass: "avatar-eleanor",
    img: "/eleanor.png",
    alt: "Eleanor Crowe",
    fallback: "EC",
    placeholder: 'Ask Eleanor anything… "How do I get my kids into camping?"',
    idleAnswer: "Eleanor went quiet. Try again.",
    errorAnswer: "Eleanor is out of radio range. Try again in a minute.",
  },
};

export default function AskBar() {
  const [persona, setPersona] = useState("amos");
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    function onSetPersona(e) {
      if (e.detail === "amos" || e.detail === "eleanor") {
        setPersona(e.detail);
      }
    }
    window.addEventListener("set-persona", onSetPersona);
    return () => window.removeEventListener("set-persona", onSetPersona);
  }, []);

  const p = PERSONAS[persona];

  async function ask() {
    const question = q.trim();
    if (!question || loading) return;
    setLoading(true);
    setAnswer("");
    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, persona }),
      });
      const data = await res.json();
      setAnswer(data.answer || p.idleAnswer);
    } catch {
      setAnswer(p.errorAnswer);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="ask-amos">
      <div className="ask-inner">
        <div className={`avatar ${p.avatarClass} avatar-sm`}>
          <img src={p.img} alt={p.alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <span className="avatar-fallback">{p.fallback}</span>
        </div>
        <div className="ask-box">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder={p.placeholder}
          />
          <button onClick={ask}>{loading ? "…" : `Ask ${p.label}`}</button>
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
          <div className={`avatar ${p.avatarClass} avatar-xs`}>
            <img src={p.img} alt="" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <span className="avatar-fallback">{p.fallback}</span>
          </div>
          <span>{p.label}: {answer}</span>
        </div>
      )}
    </div>
  );
}
