"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      router.push("/admin");
      router.refresh();
    } else {
      setError("Incorrect password.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bone px-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm border border-rule bg-white p-8">
        <p className="eyebrow text-red">Outlier Method</p>
        <h1 className="mt-2 font-serif text-2xl font-semibold text-navy-900">Admin</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mt-6 w-full border border-rule px-3 py-2 focus:border-navy-900 focus:outline-none"
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-red">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full border border-navy-900 bg-navy-900 px-4 py-2 font-medium text-bone hover:bg-navy-700"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
