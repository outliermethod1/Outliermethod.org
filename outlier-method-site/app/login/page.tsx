"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { setUserToken } from "@/lib/auth-client";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const verified = params.get("verified") === "1";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Login failed.");
      return;
    }
    setUserToken(data.token);
    const next = params.get("next");
    if (!data.profileComplete) {
      router.push(`/profile?setup=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
    } else {
      router.push(next || "/profile");
    }
  }

  return (
    <div className="w-full max-w-sm">
      <p className="eyebrow text-red">Welcome back</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900">Log in</h1>

      {verified && (
        <p className="mt-4 border border-navy-900 bg-white p-4 text-[13px] text-navy-900">
          Email verified — log in below.
        </p>
      )}

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
          {busy ? "Logging in…" : "Log in"}
        </button>
      </form>

      <p className="mt-6 text-[13px] text-slate">
        Need an account? <Link href="/signup" className="text-navy-900 underline">Sign up</Link>
      </p>
      <p className="mt-2 text-[13px] text-slate">
        Outlier Method staff — <Link href="/admin/login" className="text-navy-900 underline">admin login</Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen items-center justify-center bg-bone px-6 py-16">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
