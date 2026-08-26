"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { authFetch, setUserToken } from "@/lib/auth-client";

function SignupForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [foundingCode, setFoundingCode] = useState(params.get("code") ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, foundingCode: foundingCode || undefined }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Signup failed.");
      return;
    }

    setUserToken(data.token);

    const conversationId = params.get("conversationId");
    if (conversationId) {
      await authFetch("/api/conversations/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      }).catch(() => {});
    }

    let next = params.get("next");
    if (next && conversationId) next = `${next}?resume=${conversationId}`;

    router.push(`/profile?setup=1${next ? `&next=${encodeURIComponent(next)}` : ""}`);
  }

  return (
    <div className="w-full max-w-sm">
      <p className="eyebrow text-red">Beta access</p>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900">Create your account</h1>
      <p className="mt-3 text-[14px] text-slate">
        Free — 5 cited eligibility answers a month, plus unlimited operational help, saved conversations,
        and PDF export.
      </p>

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
        <label className="block text-[13px] text-slate">
          Founding-member code (optional)
          <input
            value={foundingCode}
            onChange={(e) => setFoundingCode(e.target.value)}
            placeholder="Leave blank unless you have one"
            className="mt-1 block w-full border border-rule bg-white px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
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

      <p className="mt-6 text-[13px] text-slate">
        Already have an account? <Link href="/login" className="text-navy-900 underline">Log in</Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen items-center justify-center bg-bone px-6 py-16">
        <Suspense fallback={null}>
          <SignupForm />
        </Suspense>
      </main>
      <SiteFooter />
    </>
  );
}
