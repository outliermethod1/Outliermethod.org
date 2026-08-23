"use client";

import { useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setStatus(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Signup failed.");
      return;
    }
    setStatus("Check your email for a verification link, then log in.");
  }

  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen items-center justify-center bg-bone px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="eyebrow text-red">Beta access</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900">Create your account</h1>
          <p className="mt-3 text-[14px] text-slate">
            You&rsquo;ll get a verification email before you can log in.
          </p>

          {status ? (
            <p className="mt-8 border border-navy-900 bg-white p-5 text-[14px] text-navy-900">{status}</p>
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
              <label className="block text-[13px] text-slate">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  minLength={8}
                  className="mt-1 block w-full border border-rule bg-white px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
                  required
                />
              </label>
              {error && <p className="text-[13px] text-red">{error}</p>}
              <button
                type="submit"
                disabled={busy}
                className="w-full border border-red bg-red px-5 py-3 text-[14px] font-medium text-white hover:bg-[#8c1d27] disabled:opacity-50"
              >
                {busy ? "Creating account…" : "Create account"}
              </button>
            </form>
          )}

          <p className="mt-6 text-[13px] text-slate">
            Already have an account? <Link href="/login" className="text-navy-900 underline">Log in</Link>
          </p>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
