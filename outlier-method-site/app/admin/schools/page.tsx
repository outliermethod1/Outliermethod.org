"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminSchoolsPage() {
  const [stateCode, setStateCode] = useState("");
  const [csv, setCsv] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [counts, setCounts] = useState<Record<string, number>>({});

  function loadCounts() {
    fetch("/api/admin/schools")
      .then((r) => r.json())
      .then((d) => setCounts(d.counts ?? {}));
  }

  useEffect(loadCounts, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const res = await fetch("/api/admin/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stateCode, csv }),
    });
    const data = await res.json();
    setBusy(false);
    setStatus(res.ok ? `Loaded ${data.count} schools for ${stateCode.toUpperCase()}.` : data.error ?? "Upload failed");
    if (res.ok) loadCounts();
  }

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="font-serif text-2xl font-semibold text-navy-900">Member schools</h1>
        <p className="mt-2 text-sm text-slate">
          Load a state&rsquo;s official classification list as CSV. Sourced from the state association&rsquo;s own
          published classification/realignment document — not MaxPreps, which has no public API and isn&rsquo;t the
          authoritative source anyway. Coach Eli looks these up on demand rather than holding every school in
          context, so this can grow to thousands of rows per state without cost.
        </p>
        <p className="mt-3 text-[13px] text-slate">
          CSV header: <code className="bg-red-tint px-1">name,city,classification,district_region,sports_sponsored</code>
          {" "}&mdash; only <code className="bg-red-tint px-1">name</code> is required. Separate multiple sports with
          {" "}<code className="bg-red-tint px-1">|</code>. Re-uploading a state&rsquo;s list updates existing rows by name.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 border border-rule bg-white p-6">
          <label className="block text-[13px] text-slate">
            State code (e.g. co)
            <input
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="mt-1 block w-full border border-rule px-3 py-2 text-[14px]"
              required
            />
          </label>
          <label className="block text-[13px] text-slate">
            CSV
            <textarea
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              rows={10}
              placeholder={"name,city,classification,district_region,sports_sponsored\nCherry Creek,Greenwood Village,5A,Continental League,football|basketball|track"}
              className="mt-1 block w-full border border-rule px-3 py-2 font-mono text-[13px]"
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="border border-navy-900 bg-navy-900 px-5 py-2 text-[14px] font-medium text-white hover:bg-navy-700 disabled:opacity-50"
          >
            {busy ? "Loading…" : "Load schools"}
          </button>
          {status && <p className="text-[13px] text-slate">{status}</p>}
        </form>

        <h2 className="mt-10 eyebrow text-navy-900">Schools loaded, by state</h2>
        <div className="mt-4 border border-rule bg-white">
          {Object.keys(counts).length === 0 && (
            <p className="px-4 py-4 text-[13px] text-slate">No schools loaded yet for any state.</p>
          )}
          {Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .map(([code, count]) => (
              <div key={code} className="flex justify-between border-b border-rule px-4 py-2 text-[13px] last:border-b-0">
                <span className="font-medium text-navy-900">{code.toUpperCase()}</span>
                <span className="text-slate">{count} schools</span>
              </div>
            ))}
        </div>
      </main>
    </div>
  );
}
