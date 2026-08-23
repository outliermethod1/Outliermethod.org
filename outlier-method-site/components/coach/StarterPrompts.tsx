"use client";

const PROMPTS = [
  "A student transferred in mid-season — walk me through eligibility.",
  "Draft a transportation request form for an out-of-state tournament.",
  "We're short officials for Friday. What are my options?",
];

export function StarterPrompts({ onPick }: { onPick: (text: string) => void }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {PROMPTS.map((p) => (
        <button
          key={p}
          onClick={() => onPick(p)}
          className="border border-rule bg-white p-4 text-left text-[14px] text-ink hover:border-navy-900"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
