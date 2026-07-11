"use client";
import { useState } from "react";
import { AUDIO } from "../lib/config";

/* ============================================================
   COMPACT FIELD AUDIO PLAYER
   Phase 1 wiring for your SoundCloud tracks:
   1) Set AUDIO.soundcloudUrl in lib/config.js to your track URL.
   2) Add to this component:
      - a hidden iframe:
        <iframe id="scFrame" style={{display:"none"}} allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(AUDIO.soundcloudUrl)}`} />
      - load the widget API once (in a useEffect):
        const s = document.createElement("script");
        s.src = "https://w.soundcloud.com/player/api.js";
        document.body.appendChild(s);
      - then control it:
        const widget = window.SC.Widget(document.getElementById("scFrame"));
        widget.toggle() on button click;
        widget.bind(SC.Widget.Events.PLAY, () => setPlaying(true));
        widget.bind(SC.Widget.Events.PAUSE, () => setPlaying(false));
   The pill UI below stays exactly the same — only the audio
   source changes. No big SoundCloud player ever shows on page.
============================================================ */

export default function FieldAudio() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className={`field-audio ${playing ? "playing" : ""}`}>
      <button
        className="fa-btn"
        aria-label={playing ? "Pause field music" : "Play field music"}
        onClick={() => setPlaying(!playing)}
      >
        {playing ? "❚❚" : "▶"}
      </button>
      <div className="fa-meta">
        <div className="fa-label">{AUDIO.label}</div>
        <div className="fa-track">{AUDIO.track}</div>
      </div>
      <div className="fa-wave">
        <i />
        <i />
        <i />
        <i />
      </div>
    </div>
  );
}
