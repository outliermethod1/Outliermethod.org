"use client";
import { useState } from "react";

export default function PathsRow() {
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  function subscribe(e) {
    e.preventDefault();
    if (!email.trim()) return;
    // Phase 2: post to your email provider (ConvertKit/Beehiiv/Mailchimp API).
    setSubscribed(true);
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
        <h3 className="display">Get Outlier Updates</h3>
        <p>Gear picks, guides, and stories straight to your inbox.</p>
        <form onSubmit={subscribe}>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit">{subscribed ? "Subscribed ✓" : "Subscribe"}</button>
        </form>
      </div>
    </div>
  );
}
