"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { StateOption } from "@/lib/states-client";

export function StateSelector({
  states,
  value,
  onChange,
  variant = "compact",
  theme = "light",
}: {
  states: StateOption[];
  value: string | null;
  onChange: (code: string) => void;
  variant?: "compact" | "full";
  theme?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<"high_school" | "college">("high_school");
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = states.find((s) => s.state_code === value) ?? null;

  // Open on whichever tab the current selection belongs to, so switching
  // states doesn't silently land you on the wrong tab.
  useEffect(() => {
    if (open && selected) setLevel(selected.level);
  }, [open, selected]);

  const filtered = useMemo(() => {
    const byLevel = states.filter((s) => s.level === level);
    const q = query.trim().toLowerCase();
    if (!q) return byLevel;
    return byLevel.filter(
      (s) => s.state_name.toLowerCase().includes(q) || s.association_name.toLowerCase().includes(q)
    );
  }, [states, query, level]);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
      clearTimeout(t);
    };
  }, [open]);

  function pick(code: string) {
    onChange(code);
    setOpen(false);
    setQuery("");
  }

  const dark = theme === "dark";
  const buttonClasses =
    variant === "full"
      ? "w-full max-w-sm border border-navy-900 bg-white px-5 py-3 text-left text-[15px] font-medium text-navy-900 hover:border-red"
      : dark
        ? "w-full min-w-0 border border-bone/25 bg-navy-900 px-3 py-2 text-left text-[13px] font-medium text-bone hover:border-red"
        : "w-full min-w-0 border border-navy-900 bg-white px-3 py-2 text-left text-[13px] font-medium text-navy-900 hover:border-red";

  return (
    <div ref={rootRef} className="relative min-w-0 max-w-full">
      <button type="button" onClick={() => setOpen((o) => !o)} className={buttonClasses}>
        {selected ? (
          <span className="flex min-w-0 items-center justify-between gap-3">
            <span className="min-w-0 truncate">
              {selected.association_name}
              {variant === "full" && <span className="text-slate"> &middot; {selected.state_name}</span>}
            </span>
            <span className="shrink-0 text-slate">&#9662;</span>
          </span>
        ) : (
          <span className="flex min-w-0 items-center justify-between gap-3 text-slate">
            <span className="truncate">Select your state association</span>
            <span className="shrink-0">&#9662;</span>
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Mobile: full-screen sheet so the list never runs off-screen. */}
          <div className="fixed inset-0 z-50 bg-navy-900/40 sm:hidden" onClick={() => setOpen(false)} />
          <div
            className="fixed inset-x-4 top-16 bottom-16 z-50 flex flex-col border border-navy-900 bg-white sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:bottom-auto sm:mt-2 sm:w-80"
          >
            <div className="flex border-b border-rule">
              {(["high_school", "college"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`flex-1 py-2 text-[12px] font-medium uppercase tracking-wide ${
                    level === l ? "border-b-2 border-red text-navy-900" : "text-slate hover:text-navy-900"
                  }`}
                >
                  {l === "high_school" ? "High School" : "College"}
                </button>
              ))}
            </div>
            <div className="border-b border-rule p-3">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search states or associations…"
                className="w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto sm:max-h-80">
              {filtered.length === 0 && (
                <p className="px-4 py-6 text-center text-[13px] text-slate">No matches.</p>
              )}
              {filtered.map((s) => (
                <button
                  key={s.state_code}
                  type="button"
                  onClick={() => pick(s.state_code)}
                  className={`block w-full px-4 py-3 text-left text-[14px] hover:bg-red-tint ${
                    s.state_code === value ? "bg-red-tint font-medium text-navy-900" : "text-ink"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-serif text-[15px] font-medium text-navy-900">{s.state_name}</span>
                    {s.covered === false && (
                      <span className="border border-rule px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-slate">
                        Bylaws not indexed yet
                      </span>
                    )}
                  </span>
                  <span className="block text-[12px] text-slate">{s.association_name}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
