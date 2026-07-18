"use client";
import LiveField from "./LiveField";

export default function Hero() {
  return (
    <div className="hero">
      <div className="hero-main">
        <svg className="hero-ridge" viewBox="0 0 1000 500" preserveAspectRatio="none">
          <path
            d="M0,340 L120,270 L210,310 L330,200 L420,260 L540,150 L640,230 L760,120 L860,200 L1000,140 L1000,500 L0,500 Z"
            fill="rgba(13,21,16,0.35)"
          />
          <path
            d="M0,400 L150,340 L260,380 L400,290 L520,350 L660,260 L790,330 L900,270 L1000,310 L1000,500 L0,500 Z"
            fill="rgba(13,21,16,0.55)"
          />
        </svg>
        <div className="hero-copy">
          <h1 className="display">
            You don&apos;t need
            <br />
            to be rich to
            <br />
            <span className="accent">live well.</span>
          </h1>
          <div className="hero-star">★</div>
          <p>
            Field-tested gear, old-school wisdom, and honest advice to help you get
            outside without getting screwed.
          </p>
          <div>
            <a href="/gear" className="btn btn-solid">
              Browse Gear
            </a>
            <a href="/blog" className="btn btn-ghost">
              Read the Blog
            </a>
          </div>
        </div>
      </div>
      <div className="hero-side">
        <LiveField />
      </div>
    </div>
  );
}
