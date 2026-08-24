"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminNav } from "@/components/admin/AdminNav";

interface Escalation {
  id: string;
  message_id: string;
  conversation_id: string;
  message_content: string;
  state_code: string;
  reporter_note: string | null;
  status: "open" | "resolved";
  created_at: string;
}

export default function AdminEscalationsPage() {
  const [escalations, setEscalations] = useState<Escalation[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  function load() {
    fetch("/api/admin/escalations")
      .then((r) => r.json())
      .then((d) => setEscalations(d.escalations ?? []));
  }

  useEffect(load, []);

  async function resolve(id: string) {
    setBusyId(id);
    await fetch(`/api/admin/escalations/${id}/resolve`, { method: "POST" });
    setBusyId(null);
    load();
  }

  const open = escalations.filter((e) => e.status === "open");
  const resolved = escalations.filter((e) => e.status === "resolved");

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-serif text-2xl font-semibold text-navy-900">Reported exchanges</h1>
        <p className="mt-2 text-sm text-slate">
          Users can report an exchange from its permanent record. Each report links straight to the
          exact record — question, answer, and every bylaw cited.
        </p>

        <h2 className="mt-8 eyebrow text-red">Open ({open.length})</h2>
        <div className="mt-3 space-y-3">
          {open.length === 0 && <p className="text-sm text-slate">Nothing open.</p>}
          {open.map((e) => (
            <div key={e.id} className="border border-red bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[12px] text-slate">
                    {e.state_code.toUpperCase()} &middot; {new Date(e.created_at).toLocaleString()}
                  </p>
                  {e.reporter_note && <p className="mt-1 text-[14px] text-ink">&ldquo;{e.reporter_note}&rdquo;</p>}
                  <p className="mt-1 truncate text-[13px] text-slate">{e.message_content}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-2">
                  <Link
                    href={`/coach/audit/${e.message_id}`}
                    target="_blank"
                    className="text-[12px] font-medium text-navy-900 underline"
                  >
                    View record
                  </Link>
                  <button
                    onClick={() => resolve(e.id)}
                    disabled={busyId === e.id}
                    className="text-[12px] font-medium text-slate hover:text-navy-900 disabled:opacity-50"
                  >
                    {busyId === e.id ? "Resolving…" : "Mark resolved"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {resolved.length > 0 && (
          <>
            <h2 className="mt-8 eyebrow text-slate">Resolved ({resolved.length})</h2>
            <div className="mt-3 space-y-2">
              {resolved.map((e) => (
                <div key={e.id} className="border border-rule bg-white p-3 text-[13px] text-slate">
                  <span>{e.state_code.toUpperCase()} &middot; {new Date(e.created_at).toLocaleDateString()}</span>
                  <Link href={`/coach/audit/${e.message_id}`} target="_blank" className="ml-3 underline">
                    View record
                  </Link>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
