"use client";
import { useState } from "react";

export default function PathsRow() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [already, setAlready] = useState(false);
  const [error, setError] = useState("");

  async function subscribe(e) {
    e.preventDefault();
    if (!email.trim() || pending) return;
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (data.ok) {
        setAlready(Boolean(data.already));
        setSubscribed(true);
      } else {
        setError(data.message || "Something went wrong — try again.");
      }
    } catch {
      setError("Something went wrong — try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="paths-row">
      <div className="start-smart">
        <div className="stamp">
          Start
          <br />
          Smart
          <br />
          Not Broke
        </div>
        <div>
          <h3 className="display">The Start Smart Series</h3>
          <p>
            Everything you need to get in the field for less than $200. Proven gear,
            earned the smart way.
          </p>
          <a href="/blog">View Guides →</a>
        </div>
      </div>

      <div className="quick-paths">
        <div className="qp">
          <div className="qp-icon">🦌</div>
          <h4>Hunting</h4>
          <p>
            Start for
            <br />
            Under $200
          </p>
        </div>
        <div className="qp">
          <div className="qp-icon">🐟</div>
          <h4>Fishing</h4>
          <p>
            Start for
            <br />
            Under $150
          </p>
        </div>
        <div className="qp">
          <div className="qp-icon">⛺</div>
          <h4>Camping</h4>
          <p>
            Start for
            <br />
            Under $100
          </p>
        </div>
        <div className="qp">
          <div className="qp-icon">👣</div>
          <h4>Kids &amp; Family</h4>
          <p>
            Get Them
            <br />
            Outside
          </p>
        </div>
      </div>

      <div className="updates">
        <h3 className="display">The Campfire Weekly</h3>
        <p>Gear picks, field wisdom, and what&apos;s moving in the wild — once a week. No spam, no fluff.</p>
        {subscribed ? (
          <p className="subscribe-done">
            {already
              ? "You're already at the fire. 🔥"
              : "You're in. Watch your inbox for The Campfire Weekly. 🔥"}
          </p>
        ) : (
          <>
            {error && <p className="subscribe-error">{error}</p>}
            <form onSubmit={subscribe}>
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" disabled={pending}>
                {pending ? "Joining…" : "Subscribe"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
