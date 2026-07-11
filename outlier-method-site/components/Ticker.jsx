import { TICKER_ITEMS } from "../lib/config";

export default function Ticker() {
  // Items are doubled so the CSS loop is seamless.
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker">
      <div className="ticker-label">
        <div className="live-dot" />
        Live Now
      </div>
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span>{item.icon}</span>
            <b>{item.text}</b>
            <span>{item.detail}</span>
            <span className="sep" style={{ marginLeft: "30px" }}>✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
