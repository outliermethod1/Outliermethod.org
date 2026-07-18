"use client";
import { useEffect, useState } from "react";
import { CAMPFIRE } from "../lib/config";

export default function Campfire() {
  const [date, setDate] = useState("");
  useEffect(() => {
    setDate(
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    );
  }, []);

  return (
    <div className="campfire">
      <div className="campfire-head">
        <div className="cf-flame">🔥</div>
        <h2 className="display">Tonight Around the Campfire</h2>
        <div className="cf-date">{date}</div>
      </div>
      <div className="campfire-grid">
        <div className="cf-card">
          <div className="cf-label">Tonight&apos;s Song</div>
          <div className="cf-main">{CAMPFIRE.song.title}</div>
          <div className="cf-sub">{CAMPFIRE.song.sub}</div>
          <a href="#field-audio">Listen →</a>
        </div>
        <div className="cf-card">
          <div className="cf-label">Words Worth Keeping</div>
          <div className="cf-main cf-quote">{CAMPFIRE.quote.text}</div>
          <div className="cf-sub">{CAMPFIRE.quote.author}</div>
        </div>
        <div className="cf-card">
          <div className="cf-label">Tonight&apos;s Read</div>
          <div className="cf-main">{CAMPFIRE.article.title}</div>
          <div className="cf-sub">{CAMPFIRE.article.sub}</div>
          <a href="/blog">Read →</a>
        </div>
        <div className="cf-card">
          <div className="cf-label">Watch the Wild</div>
          <div className="cf-main">{CAMPFIRE.wildlife.title}</div>
          <div className="cf-sub">{CAMPFIRE.wildlife.sub}</div>
          <a href="#live">Watch Live →</a>
        </div>
      </div>
    </div>
  );
}
