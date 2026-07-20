const LABELS = [
  ["durability", "Durability"],
  ["value", "Value"],
  ["repairability", "Repairability"],
  ["beginnerFriendly", "Beginner Friendly"],
];

function Stars({ score }) {
  return (
    <span className="ft-stars">
      {"★".repeat(score)}
      <span className="ft-stars-empty">{"★".repeat(5 - score)}</span>
    </span>
  );
}

export default function OutlierScore({ scores, size = "sm" }) {
  return (
    <div className={`ft-score ${size === "lg" ? "ft-score-lg" : ""}`}>
      <div className="ft-score-title">The Outlier Score™</div>
      {LABELS.map(([key, label]) => (
        <div className="ft-score-row" key={key}>
          <span>{label}</span>
          <Stars score={scores[key] || 0} />
        </div>
      ))}
    </div>
  );
}
