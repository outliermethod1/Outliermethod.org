"use client";

import { useState } from "react";

export function WaitlistForm({
  stateCode,
  stateName,
  bylawId,
  label,
}: {
  stateCode?: string;
  stateName?: string;
  bylawId?: string;
  label?: string;
}) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        stateCode,
        bylawId,
        kind: bylawId ? "bylaw_amendment" : "state_coverage",
      }),
    }).catch(() => {});
    setBusy(false);
    setDone(true);
  }

  if (done) {
    return <p className="mt-3 text-[12px] text-navy-900">You&rsquo;re on the list — thanks.</p>;
  }

  return (
    <form onSubmit={onSubmit} className="mt-3 flex gap-1.5">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@school.org"
        className="min-w-0 flex-1 border border-rule px-2 py-1.5 text-[12px] focus:border-navy-900 focus:outline-none"
      />
      <button
        type="submit"
        disabled={busy}
        className="shrink-0 border border-navy-900 bg-navy-900 px-2.5 py-1.5 text-[11px] font-medium text-bone hover:bg-navy-700 disabled:opacity-50"
      >
        {busy ? "…" : label ?? "Notify me"}
      </button>
    </form>
  );
}
