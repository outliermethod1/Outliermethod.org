"use client";
import { useEffect, useRef, useState } from "react";

const HINTS = ["Public land near me?", "Best wool jacket under $100?"];

const AMOS = {
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
};

const DEFAULT_NOTE =
  "Amos is our AI field guide — ask him about gear, public land, tactics, " +
  "or getting started. Real advice, campfire delivery.";

export default function AskBar({
  context = "",
  hints = HINTS,
  openingMessage = "",
  note = DEFAULT_NOTE,
}) {
  const [q, setQ] = useState("");
  const [messages, setMessages] = useState(() =>
    openingMessage ? [{ role: "assistant", content: openingMessage }] : []
  );
  const [loading, setLoading] = useState(false);
  const threadRef = useRef(null);

  useEffect(() => {
    if (threadRef.current) {
      threadRef.current.scrollTop = threadRef.current.scrollHeight;
    }
  }, [messages, loading]);

  async function ask() {
    const question = q.trim();
    if (!question || loading) return;

    const userMsg = { role: "user", content: question };
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
          context,
        }),
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.answer || AMOS.idleAnswer },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: AMOS.errorAnswer },
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
        <div className={`avatar ${AMOS.avatarClass} avatar-sm`}>
          <img src={AMOS.img} alt={AMOS.alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />
          <span className="avatar-fallback">{AMOS.fallback}</span>
        </div>
        <div className="ask-box">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && ask()}
            placeholder={AMOS.placeholder}
          />
          <button onClick={ask}>{loading ? "…" : `Ask ${AMOS.label}`}</button>
        </div>
        <div className="ask-hints">
          {hints.map((h) => (
            <span key={h} onClick={() => setQ(h)}>
              {h}
            </span>
          ))}
        </div>
      </div>
      <p className="guides-note">{note}</p>

      {messages.length > 0 && (
        <>
          <div className="ask-thread-head">
            <button className="ask-clear" onClick={clearConversation}>Clear</button>
          </div>
          <div className="ask-thread" ref={threadRef}>
            {messages.map((m, i) => (
              <div key={i} className={`ask-msg ${m.role}`}>
                {m.role === "assistant" && (
                  <div className={`avatar ${AMOS.avatarClass} avatar-xs`}>
                    <img src={AMOS.img} alt={AMOS.alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    <span className="avatar-fallback">{AMOS.fallback}</span>
                  </div>
                )}
                <div className="ask-bubble">{m.content}</div>
              </div>
            ))}
            {loading && (
              <div className="ask-msg assistant">
                <div className={`avatar ${AMOS.avatarClass} avatar-xs`}>
                  <img src={AMOS.img} alt={AMOS.alt} onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  <span className="avatar-fallback">{AMOS.fallback}</span>
                </div>
                <div className="ask-bubble ask-thinking">{AMOS.label} is thinking…</div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
