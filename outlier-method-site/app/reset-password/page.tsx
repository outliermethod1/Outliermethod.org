"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setBusy(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Reset failed.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 1500);
  }

  if (!token) {
    return (
      <p className="mt-6 border border-red bg-white p-4 text-[13px] text-red">
        This reset link is missing its token. Request a new one from{" "}
        <Link href="/forgot-password" className="underline">
          the forgot password page
        </Link>
        .
      </p>
    );
  }

  if (done) {
    return (
      <p className="mt-6 border border-navy-900 bg-white p-4 text-[13px] text-navy-900">
        Password updated. Taking you to log in&hellip;
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-4">
      <label className="block text-[13px] text-slate">
        New password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full border border-rule bg-white px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
          required
          minLength={8}
        />
      </label>
      <label className="block text-[13px] text-slate">
        Confirm new password
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="mt-1 block w-full border border-rule bg-white px-3 py-2 text-[14px] focus:border-navy-900 focus:outline-none"
          required
          minLength={8}
        />
      </label>
      {error && <p className="text-[13px] text-red">{error}</p>}
      <button
        type="submit"
        disabled={busy}
        className="w-full border border-red bg-red px-5 py-3 text-[14px] font-medium text-white hover:bg-[#8c1d27] disabled:opacity-50"
      >
        {busy ? "Saving…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex min-h-screen items-center justify-center bg-bone px-6 py-16">
        <div className="w-full max-w-sm">
          <p className="eyebrow text-red">Reset password</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900">Set a new password</h1>
          <Suspense fallback={null}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
