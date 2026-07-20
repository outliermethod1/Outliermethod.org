"use client";
import { useEffect, useRef, useState } from "react";

const HINTS = ["Public land near me?", "Best wool jacket under $100?"];

const PERSONAS = {
  amos: {
    label: "Amos",
    name: "Amos Flint",
    role: "Old Trapper. Public Land Expert.",
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
    name: "Eleanor Crowe",
    role: "Outdoorswoman. Family & Gear Advisor.",
    avatarClass: "avatar-eleanor",
    img: "/eleanor.png",
    alt: "Eleanor Crowe",
    fallback: "EC",
    placeholder: 'Ask Eleanor anything… "How do I get my kids into camping?"',
    idleAnswer: "Eleanor went quiet. Try again.",
    errorAnswer: "Eleanor is out of radio range. Try again in a minute.",
  },
};

const DEFAULT_NOTE =
  "Amos and Eleanor are our AI field guides — ask them about gear, public land, " +
  "tactics, or getting started. Real advice, campfire delivery.";

export default function AskBar({
  initialPersona = "amos",
  context = "",
  hints = HINTS,
  showPersonaChips = true,
  openingMessage = "",
  note = DEFAULT_NOTE,
}) {
  const [persona, setPersona] = useState(initialPersona);
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState(() =>
    openingMessage ? [{ role: "assistant", content: openingMessage, persona: initialPersona }] : []
  );
  const [loading, setLoading] = useState(false);
  const threadRef = useRef(null);

  useEffect(() => {
    function onSetPersona(e) {
      if (e.detail === "amos" || e.detail === "eleanor") {
        setPersona(e.detail);
      }
    }
    window.addEventListener("set-persona", onSetPersona);
    return () => window.removeEventListener("set-persona", onSetPersona);
  }, []);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const p = PERSONAS[persona];

  async function ask() {
    const question = q.trim();
    if (!question || loading) return;

    const userMsg = { role: "user", content: question, persona };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setQ("");
    setLoading(true);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map(({ role, content }) => ({ role, content })),
          persona,
          context,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || p.idleAnswer, persona },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: p.errorAnswer, persona },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    setMessages([]);
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
          {hints.map((h) => (
            <span key={h} onClick={() => setQ(h)}>
              {h}
            </span>
          ))}
        </div>
      </div>
      {showPersonaChips && (
        <div className="persona-chips">
          {Object.entries(PERSONAS).map(([key, entry]) => (
            <button
              key={key}
              className={`persona-chip ${persona === key ? "active" : ""}`}
              onClick={() => setPersona(key)}
            >
              <div className={`avatar ${entry.avatarClass} avatar-chip`}>
                <img src={entry.img} alt={entry.alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                <span className="avatar-fallback">{entry.fallback}</span>
              </div>
              <div className="chip-meta">
                <div className="chip-name display">{entry.name}</div>
                <div className="chip-role">{entry.role}</div>
              </div>
            </button>
          ))}
        </div>
      )}
      <p className="guides-note">{note}</p>

      {messages.length > 0 && (
        <>
          <div className="ask-thread-head">
            <button className="ask-clear" onClick={clearConversation}>Clear</button>
          </div>
          <div className="ask-thread" ref={threadRef}>
            {messages.map((m, i) => {
              const mp = PERSONAS[m.persona] || p;
              return (
                <div key={i} className={`ask-msg ${m.role}`}>
                  {m.role === "assistant" && (
                    <div className={`avatar ${mp.avatarClass} avatar-xs`}>
                      <img src={mp.img} alt={mp.alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      <span className="avatar-fallback">{mp.fallback}</span>
                    </div>
                  )}
                  <div className="ask-bubble">{m.content}</div>
                </div>
              );
            })}
            {loading && (
              <div className="ask-msg assistant">
                <div className={`avatar ${p.avatarClass} avatar-xs`}>
                  <img src={p.img} alt={p.alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  <span className="avatar-fallback">{p.fallback}</span>
                </div>
                <div className="ask-bubble ask-thinking">{p.label} is thinking…</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
