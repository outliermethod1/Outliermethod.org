"use client";
import { useState } from "react";
import { CAMS } from "../lib/config";

export default function LiveField() {
  const [active, setActive] = useState(null);
  const cam = active !== null ? CAMS[active] : null;

  return (
    <div className="live-compact">
      <div className="live-label">
        <div className="live-dot" />
        Live Cams & Field Videos
      </div>

      <div className="live-viewer live-viewer-compact" id="live">
        <div className="live-screen">
          {cam && cam.embed ? (
            // Lazy-loaded only on selection — keeps the page fast.
            <iframe src={cam.embed} allow="autoplay; fullscreen" title={cam.name} />
          ) : (
            <div className="live-placeholder">
              <div className="cam-icon">📡</div>
              <h3 className="display">{cam ? cam.name : "Pick a cam. Watch the wild."}</h3>
              <p>
                {cam
                  ? "Stream slot ready — paste this cam's embed URL into lib/config.js."
                  : "Select a live stream from the list."}
              </p>
            </div>
          )}
        </div>
        <div className="live-bar">
          <div className="badge">
            <div className="live-dot" />
            Live Now
          </div>
          <div className="cam-name">{cam ? cam.name : "No cam selected"}</div>
          <div className="cam-loc utility">{cam ? cam.loc.toUpperCase() : "—"}</div>
        </div>
      </div>

      <div className="cam-row">
        {CAMS.map((c, i) => (
          <button
            key={c.name}
            className={`cam-chip ${active === i ? "active" : ""}`}
            onClick={() => setActive(i)}
          >
            <span className="c-icon">{c.icon}</span>
            <span className="c-name">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
