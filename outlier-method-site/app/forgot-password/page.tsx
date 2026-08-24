"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    setBusy(false);
    setSent(true);
  }

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen items-center justify-center bg-bone px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="eyebrow text-red">Reset password</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900">Forgot your password?</h1>

          {sent ? (
            <p className="mt-6 border border-navy-900 bg-white p-4 text-[13px] text-navy-900">
              If that email has an account, a reset link is on its way. Check your inbox — the link
              expires in 1 hour.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <label className="block text-[13px] text-slate">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full border border-rule bg-white px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                  required
                />
              </label>
              <button
                type="submit"
                disabled={busy}
                className="w-full border border-red bg-red px-5 py-3 text-[14px] font-medium text-white hover:bg-[#8c1d27] disabled:opacity-50"
              >
                {busy ? "Sending…" : "Send reset link"}
              </button>
            </form>
          )}

          <p className="mt-6 text-[13px] text-slate">
            <Link href="/login" className="text-navy-900 underline">
              Back to log in
            </Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
