"use client";

export function CitationChip({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="mx-0.5 inline-flex items-center border border-red bg-red-tint px-1.5 py-0.5 align-middle text-[11px] font-medium tracking-wide text-red hover:bg-red hover:text-white"
    >
      {label}
    </button>
  );
}
