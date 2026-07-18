"use client";

function askPersona(persona) {
  window.dispatchEvent(new CustomEvent("set-persona", { detail: persona }));
  document.getElementById("ask")?.scrollIntoView({ behavior: "smooth" });
}

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
            <a href="#products" className="btn btn-solid">
              Browse Gear
            </a>
            <a href="#blog" className="btn btn-ghost">
              Read the Blog
            </a>
          </div>
        </div>
      </div>

      {/* Amos Flint */}
      <div className="persona">
        <div className="persona-head avatar-head">
          <div className="avatar avatar-amos">
            <img src="/amos.png" alt="Amos Flint" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <span className="avatar-fallback">AF</span>
          </div>
          <div>
            <div className="p-name display">Amos Flint</div>
            <div className="p-role">
              Old Trapper. Maps. Gear.
              <br />
              Public Land Expert.
            </div>
          </div>
        </div>
        <div className="persona-quote">
          &quot;I&apos;ve walked it, mapped it, and probably slept in it.&quot;
        </div>
        <a href="#ask" className="btn btn-solid" onClick={(e) => { e.preventDefault(); askPersona("amos"); }}>
          Ask Amos Flint
        </a>
        <div className="persona-topics">
          <div>
            <span className="t-icon">🗺</span>Public Land Maps
          </div>
          <div>
            <span className="t-icon">🎒</span>Gear Advice
          </div>
          <div>
            <span className="t-icon">🦌</span>Hunting Tips
          </div>
          <div>
            <span className="t-icon">🌤</span>Weather Intel
          </div>
        </div>
      </div>

      {/* Eleanor Crowe */}
      <div className="persona">
        <div className="persona-head avatar-head">
          <div className="avatar avatar-eleanor">
            <img src="/eleanor.png" alt="Eleanor Crowe" onError={(e) => { e.currentTarget.style.display = "none"; }} />
            <span className="avatar-fallback">EC</span>
          </div>
          <div>
            <div className="p-name display">Eleanor Crowe</div>
            <div className="p-role">
              Outdoorswoman. Naturalist.
              <br />
              Family &amp; Gear Advisor.
            </div>
          </div>
        </div>
        <div className="persona-quote">
          &quot;You can do hard things. Let&apos;s get you outside.&quot;
        </div>
        <a href="#ask" className="btn btn-solid" onClick={(e) => { e.preventDefault(); askPersona("eleanor"); }}>
          Ask Eleanor Crowe
        </a>
        <div className="persona-topics">
          <div>
            <span className="t-icon">🧭</span>Outdoors Skills
          </div>
          <div>
            <span className="t-icon">👨‍👩‍👧</span>Family &amp; Kids
          </div>
          <div>
            <span className="t-icon">🏷</span>Gear, Earned Smart
          </div>
          <div>
            <span className="t-icon">📖</span>Field Know-How
          </div>
        </div>
      </div>
    </div>
  );
}
