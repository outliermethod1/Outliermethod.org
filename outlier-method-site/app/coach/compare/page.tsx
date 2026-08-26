"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { authFetch, getUserToken } from "@/lib/auth-client";
import type { StateOption } from "@/lib/states-client";

interface SideResult {
  code: string;
  name: string;
  association: string;
  answer: string;
  chunks: { id: string; bylaw_id: string; title: string; effective_date: string }[];
}

export default function ComparePage() {
  const [states, setStates] = useState<StateOption[]>([]);
  const [stateA, setStateA] = useState("");
  const [stateB, setStateB] = useState("");
  const [question, setQuestion] = useState(
    "A student is transferring in mid-season without a change of residence. Walk me through eligibility."
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ stateA: SideResult; stateB: SideResult } | null>(null);

  useEffect(() => {
    fetch("/api/states")
      .then((r) => r.json())
      .then((d) => setStates((d.states ?? []).filter((s: StateOption) => s.level === "high_school")));
  }, []);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    if (!stateA || !stateB) return;
    setBusy(true);
    setError(null);
    setResult(null);
    const res = await authFetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stateCodeA: stateA, stateCodeB: stateB, question }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Comparison failed.");
      return;
    }
    setResult(data);
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="eyebrow text-red">Multi-state comparison</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
            Transfers across state lines
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] text-slate">
            The hardest eligibility case is a student moving in from another state association. Ask one
            question against two states at once and see exactly where the rules diverge.
          </p>

          {!getUserToken() && (
            <p className="mt-6 border border-navy-900 bg-white p-4 text-[13px] text-navy-900">
              <Link href="/login?next=/coach/compare" className="underline">
                Log in
              </Link>{" "}
              — comparison is a paid-account feature.
            </p>
          )}

          <form onSubmit={run} className="mt-8 border border-rule bg-white p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="block text-[13px] text-slate">
                State A
                <select
                  value={stateA}
                  onChange={(e) => setStateA(e.target.value)}
                  required
                  className="mt-1 block w-full border border-rule bg-white px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                >
                  <option value="">Select…</option>
                  {states.map((s) => (
                    <option key={s.state_code} value={s.state_code}>
                      {s.state_name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-[13px] text-slate">
                State B
                <select
                  value={stateB}
                  onChange={(e) => setStateB(e.target.value)}
                  required
                  className="mt-1 block w-full border border-rule bg-white px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                >
                  <option value="">Select…</option>
                  {states.map((s) => (
                    <option key={s.state_code} value={s.state_code}>
                      {s.state_name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-4 block text-[13px] text-slate">
              Question
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="mt-1 block w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
              />
            </label>
            {error && <p className="mt-2 text-[13px] text-red">{error}</p>}
            <button
              type="submit"
              disabled={busy}
              className="mt-4 border border-red bg-red px-5 py-2.5 text-[14px] font-medium text-white hover:bg-[#8c1d27] disabled:opacity-50"
            >
              {busy ? "Comparing…" : "Compare"}
            </button>
          </form>

          {result && (
            <div className="mt-10 grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-2">
              {[result.stateA, result.stateB].map((side) => (
                <div key={side.code} className="bg-white p-6">
                  <p className="eyebrow text-red">{side.name}</p>
                  <p className="mt-1 text-[13px] text-slate">{side.association}</p>
                  <p className="mt-4 whitespace-pre-wrap text-[14px] text-ink">{side.answer}</p>
                  {side.chunks.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-rule pt-4">
                      {side.chunks.map((c) => (
                        <p key={c.id} className="text-[12px] text-slate">
                          <Link href={`/bylaws/${side.code}#chunk-${c.id}`} className="text-navy-700 underline">
                            {c.bylaw_id} — {c.title}
                          </Link>{" "}
                          (eff. {c.effective_date})
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
