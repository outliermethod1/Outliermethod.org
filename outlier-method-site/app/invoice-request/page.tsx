"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function InvoiceRequestPage() {
  const [schoolOrDistrict, setSchoolOrDistrict] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [tier, setTier] = useState<"ad" | "district">("district");
  const [schoolCount, setSchoolCount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/invoice-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        schoolOrDistrict,
        contactName,
        contactEmail,
        tier,
        schoolCount: schoolCount ? Number(schoolCount) : undefined,
        note: note || undefined,
      }),
    });
    setBusy(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Something went wrong.");
      return;
    }
    setDone(true);
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone px-6 py-16">
        <div className="mx-auto max-w-lg">
          <p className="eyebrow text-red">Pay by purchase order</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900">Request an invoice</h1>
          <p className="mt-3 text-[14px] text-slate">
            Most districts run on purchase orders, not credit cards. Tell us a bit about your school or
            district and we&rsquo;ll send an invoice (net-30) along with a W-9 and a quote your business
            office can process.
          </p>

          {done ? (
            <p className="mt-8 border border-navy-900 bg-white p-6 text-[14px] text-navy-900">
              Got it — we&rsquo;ll follow up at {contactEmail} with an invoice and the paperwork your
              business office needs.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-4 border border-rule bg-white p-6">
              <label className="block text-[13px] text-slate">
                School or district name
                <input
                  value={schoolOrDistrict}
                  onChange={(e) => setSchoolOrDistrict(e.target.value)}
                  required
                  className="mt-1 block w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                />
              </label>
              <label className="block text-[13px] text-slate">
                Your name
                <input
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  required
                  className="mt-1 block w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                />
              </label>
              <label className="block text-[13px] text-slate">
                Email
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                  className="mt-1 block w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                />
              </label>
              <label className="block text-[13px] text-slate">
                Tier
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as "ad" | "district")}
                  className="mt-1 block w-full border border-rule bg-white px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                >
                  <option value="district">District — multiple schools</option>
                  <option value="ad">AD — single school</option>
                </select>
              </label>
              {tier === "district" && (
                <label className="block text-[13px] text-slate">
                  Number of schools
                  <input
                    type="number"
                    min={1}
                    value={schoolCount}
                    onChange={(e) => setSchoolCount(e.target.value)}
                    className="mt-1 block w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                  />
                </label>
              )}
              <label className="block text-[13px] text-slate">
                Anything else? (optional)
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="mt-1 block w-full border border-rule px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                />
              </label>
              {error && <p className="text-[13px] text-red">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full border border-navy-900 bg-navy-900 px-5 py-3 text-[14px] font-medium text-bone hover:bg-navy-700 disabled:opacity-50"
              >
                {busy ? "Sending…" : "Request invoice"}
              </button>
            </form>
          )}

          <p className="mt-6 text-[13px] text-slate">
            <Link href="/pricing" className="text-navy-900 underline">
              Back to pricing
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
