"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { authFetch, getUserToken } from "@/lib/auth-client";

export default function PricingPage() {
  const [busy, setBusy] = useState<"annual" | "monthly" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function subscribe(plan: "annual" | "monthly") {
    if (!getUserToken()) {
      window.location.href = `/signup?next=${encodeURIComponent("/pricing")}`;
      return;
    }
    setBusy(plan);
    setError(null);
    const res = await authFetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    setBusy(null);
    if (!res.ok) {
      setError(data.error ?? "Couldn't start checkout.");
      return;
    }
    window.location.href = data.url;
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <p className="eyebrow text-red">Pricing</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
            One AD, or a whole district.
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] text-slate">
            Start free — five cited eligibility answers a month, no card required. Upgrade when you need
            more, memo export, and full history.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-2">
            <div className="bg-white p-8">
              <p className="eyebrow text-navy-700">Athletic Director</p>
              <p className="mt-3 font-serif text-4xl font-semibold text-navy-900">
                $390<span className="text-lg font-normal text-slate">/yr</span>
              </p>
              <p className="mt-1 text-[13px] text-slate">or $39/mo — one school, one AD</p>
              <ul className="mt-6 space-y-2 text-[14px] text-ink">
                <li>Unlimited cited eligibility answers</li>
                <li>Eligibility Memo PDF export, every answer</li>
                <li>Full searchable answer history</li>
                <li>Amendment alerts on rules you've relied on</li>
              </ul>
              <div className="mt-8 space-y-2">
                <button
                  onClick={() => subscribe("annual")}
                  disabled={busy !== null}
                  className="block w-full border border-red bg-red px-5 py-3 text-center text-[14px] font-medium text-white hover:bg-[#8c1d27] disabled:opacity-50"
                >
                  {busy === "annual" ? "Starting checkout…" : "Subscribe — $390/yr"}
                </button>
                <button
                  onClick={() => subscribe("monthly")}
                  disabled={busy !== null}
                  className="block w-full border border-navy-900 px-5 py-3 text-center text-[14px] font-medium text-navy-900 hover:bg-navy-900 hover:text-white disabled:opacity-50"
                >
                  {busy === "monthly" ? "Starting checkout…" : "Or $39/mo"}
                </button>
              </div>
              {error && <p className="mt-3 text-[13px] text-red">{error}</p>}
            </div>

            <div className="bg-white p-8">
              <p className="eyebrow text-navy-700">District</p>
              <p className="mt-3 font-serif text-4xl font-semibold text-navy-900">
                $1,200<span className="text-lg font-normal text-slate">–2,500/yr</span>
              </p>
              <p className="mt-1 text-[13px] text-slate">by school count — shared bylaw library, multiple seats</p>
              <ul className="mt-6 space-y-2 text-[14px] text-ink">
                <li>Everything in AD, per seat</li>
                <li>Shared bylaw library across schools</li>
                <li>Pay by purchase order — net-30 invoicing</li>
                <li>W-9 and a quote PDF for your business office</li>
              </ul>
              <div className="mt-8">
                <Link
                  href="/invoice-request"
                  className="block w-full border border-navy-900 bg-navy-900 px-5 py-3 text-center text-[14px] font-medium text-bone hover:bg-navy-700"
                >
                  Request an invoice / pay by PO
                </Link>
              </div>
            </div>
          </div>

          <p className="mt-8 text-[13px] text-slate">
            Free tier gives full-quality answers, just fewer of them — never a degraded response.
            Paywall is on volume, memo export, and history, not on the answer itself.
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
