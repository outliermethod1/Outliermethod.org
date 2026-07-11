import { WEATHER } from "../lib/config";

const NAV = [
  { label: "Home", href: "/", active: true },
  { label: "Trusted Products", href: "#products" },
  { label: "Outlier Originals", href: "#originals" },
  { label: "Woodworking", href: "#woodworking" },
  { label: "State Guides", href: "#states" },
  { label: "Message Board", href: "#community" },
  { label: "Blog", href: "#blog" },
];

export default function Header() {
  return (
    <header>
      <div className="header-inner">
        <a href="/" className="logo">
          <div className="logo-badge">⛰</div>
          <div className="logo-text">
            <div className="name display">Outlier Method</div>
            <div className="tag">The Outdoors Belongs To Everyone.</div>
          </div>
        </a>
        <nav>
          {NAV.map((item) => (
            <a key={item.label} href={item.href} className={item.active ? "active" : ""}>
              {item.label}
            </a>
          ))}
        </nav>
        {/* Weather: demo values from config. Phase 2 — wire to Open-Meteo. */}
        <div className="weather">
          <div className="w-icon">{WEATHER.icon}</div>
          <div className="w-temp">{WEATHER.temp}</div>
          <div className="w-meta">
            <div className="w-city">{WEATHER.city}</div>
            <div>
              Air Quality: <b>{WEATHER.air}</b>
            </div>
            <div>
              Pollen: <b>{WEATHER.pollen}</b>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
