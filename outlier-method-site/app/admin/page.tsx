"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

interface ReviewItem {
  id: string;
  state_code: string;
  blob_path: string;
  diff_summary: string | null;
  detected_at: string;
}

export default function AdminReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [effectiveDates, setEffectiveDates] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/review")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []));
  }

  useEffect(load, []);

  async function act(id: string, action: "approve" | "reject") {
    setBusy(id);
    await fetch(`/api/admin/review/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, effectiveDate: effectiveDates[id] }),
    });
    setBusy(null);
    load();
  }

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <h1 className="font-serif text-2xl font-semibold text-navy-900">Review Queue</h1>
        <p className="mt-2 text-sm text-slate">
          The crawler never publishes on its own. Every detected change lands here for approval.
        </p>

        {items.length === 0 && <p className="mt-8 text-sm text-slate">Nothing pending review.</p>}

        <div className="mt-8 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="border border-rule bg-white p-5">
              <div className="flex items-center justify-between">
                <span className="eyebrow text-red">{item.state_code.toUpperCase()}</span>
                <span className="text-[12px] text-slate">{new Date(item.detected_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-[14px] text-ink">{item.diff_summary}</p>
              <a href={item.blob_path} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[13px] text-navy-700 underline">
                View staged document
              </a>
              <div className="mt-4 flex items-center gap-3">
                <label className="text-[13px] text-slate">
                  Effective date
                  <input
                    type="date"
                    className="ml-2 border border-rule px-2 py-1 text-[13px]"
                    value={effectiveDates[item.id] ?? ""}
                    onChange={(e) => setEffectiveDates((p) => ({ ...p, [item.id]: e.target.value }))}
                  />
                </label>
                <button
                  disabled={busy === item.id}
                  onClick={() => act(item.id, "approve")}
                  className="border border-navy-900 bg-navy-900 px-4 py-1.5 text-[13px] font-medium text-bone hover:bg-navy-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  disabled={busy === item.id}
                  onClick={() => act(item.id, "reject")}
                  className="border border-rule px-4 py-1.5 text-[13px] text-slate hover:border-red hover:text-red disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
