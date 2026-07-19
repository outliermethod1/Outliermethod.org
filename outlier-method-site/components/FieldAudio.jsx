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
      const updateTitle = () => {
        widget.getCurrentSound((sound) => {
          if (sound && sound.title) setTrackTitle(sound.title);
        });
      };
      widget.bind(window.SC.Widget.Events.PLAY, () => {
        setPlaying(true);
        updateTitle();
      });
      widget.bind(window.SC.Widget.Events.PAUSE, () => setPlaying(false));
      widget.bind(window.SC.Widget.Events.PLAY_PROGRESS, updateTitle);
      // The widget advances through a playlist on its own; this only handles
      // wrapping from the last track back to the first.
      widget.bind(window.SC.Widget.Events.FINISH, () => {
        widget.getCurrentSoundIndex((index) => {
          widget.getSounds((sounds) => {
            if (index >= sounds.length - 1) widget.skip(0);
          });
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

  function nextTrack() {
    const widget = widgetRef.current;
    if (!widget) return;
    widget.getCurrentSoundIndex((index) => {
      widget.getSounds((sounds) => {
        if (index >= sounds.length - 1) widget.skip(0);
        else widget.next();
      });
    });
  }

  return (
    <>
      <div id="field-audio" className={`field-audio ${playing ? "playing" : ""}`}>
        <button
          className="fa-btn fa-skip"
          aria-label="Previous track"
          onClick={() => widgetRef.current?.prev()}
        >
          ⏮
        </button>
        <button
          className="fa-btn"
          aria-label={playing ? "Pause field music" : "Play field music"}
          onClick={() => widgetRef.current?.toggle()}
        >
          {playing ? "❚❚" : "▶"}
        </button>
        <button className="fa-btn fa-skip" aria-label="Next track" onClick={nextTrack}>
          ⏭
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
