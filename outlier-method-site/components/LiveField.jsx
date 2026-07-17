"use client";
import { useState } from "react";
import { CAMS } from "../lib/config";

export default function LiveField() {
  const [active, setActive] = useState(null);
  const cam = active !== null ? CAMS[active] : null;

  return (
    <>
      <div className="section-label">
        <div className="live-dot" />
        <h2 className="display">Live Cams & Field Videos</h2>
        <div className="rule" />
      </div>

      <div className="live-section" id="live">
        <div className="live-viewer">
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

        <div className="cam-list">
          {CAMS.map((c, i) => (
            <button
              key={c.name}
              className={`cam-tile ${active === i ? "active" : ""}`}
              onClick={() => setActive(i)}
            >
              <div className="cam-thumb" style={{ background: c.bg }}>
                {c.icon}
              </div>
              <div className="info">
                <div className="n">{c.name}</div>
                <div className="l">{c.loc}</div>
              </div>
              <div className="dot" />
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
