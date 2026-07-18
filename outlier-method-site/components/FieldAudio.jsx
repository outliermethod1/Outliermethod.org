"use client";
import { useEffect, useRef, useState } from "react";
import { AUDIO } from "../lib/config";

const SC_WIDGET_SRC = "https://w.soundcloud.com/player/api.js";
const SC_IFRAME_SRC =
  "https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/playlists/soundcloud%253Aplaylists%253A2269363256&auto_play=false";

export default function FieldAudio() {
  const [playing, setPlaying] = useState(false);
  const [trackTitle, setTrackTitle] = useState(AUDIO.track);
  const iframeRef = useRef(null);
  const widgetRef = useRef(null);

  useEffect(() => {
    function initWidget() {
      if (!window.SC || !iframeRef.current) return;
      const widget = window.SC.Widget(iframeRef.current);
      widgetRef.current = widget;
      widget.bind(window.SC.Widget.Events.PLAY, () => setPlaying(true));
      widget.bind(window.SC.Widget.Events.PAUSE, () => setPlaying(false));
      widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, () => {
        widget.getCurrentSound((sound) => {
          if (sound && sound.title) setTrackTitle(sound.title);
        });
      });
    }

    if (window.SC) {
      initWidget();
      return;
    }

    const existing = document.querySelector(`script[src="${SC_WIDGET_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", initWidget);
      return () => existing.removeEventListener("load", initWidget);
    }

    const script = document.createElement("script");
    script.src = SC_WIDGET_SRC;
    script.async = true;
    script.onload = initWidget;
    document.body.appendChild(script);
  }, []);

  return (
    <>
      <div className={`field-audio ${playing ? "playing" : ""}`}>
        <button
          className="fa-btn"
          aria-label={playing ? "Pause field music" : "Play field music"}
          onClick={() => widgetRef.current?.toggle()}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <div className="fa-meta">
          <div className="fa-label">{AUDIO.label}</div>
          <div className="fa-track">{trackTitle}</div>
        </div>
        <div className="fa-wave">
          <i />
          <i />
          <i />
          <i />
        </div>
      </div>
      <iframe
        id="scFrame"
        ref={iframeRef}
        style={{ display: "none" }}
        allow="autoplay"
        src={SC_IFRAME_SRC}
        title="SoundCloud player"
      />
    </>
  );
}
