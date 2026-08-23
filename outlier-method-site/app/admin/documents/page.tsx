"use client";

import { useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminDocumentsPage() {
  const [stateCode, setStateCode] = useState("");
  const [effectiveDate, setEffectiveDate] = useState("");
  const [slug, setSlug] = useState("handbook");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setStatus(null);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("stateCode", stateCode);
    fd.append("effectiveDate", effectiveDate);
    fd.append("slug", slug);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setBusy(false);
    setStatus(res.ok ? `Ingested ${data.chunkCount} sections.` : data.error ?? "Upload failed");
  }

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-serif text-2xl font-semibold text-navy-900">Manual document upload</h1>
        <p className="mt-2 text-sm text-slate">
          Upload a handbook or bulletin PDF for a state, with the date it takes effect. New sections supersede
          prior versions with the same bylaw number automatically.
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4 border border-rule bg-white p-6">
          <label className="block text-[13px] text-slate">
            State code (e.g. co)
            <input
              value={stateCode}
              onChange={(e) => setStateCode(e.target.value)}
              className="mt-1 block w-full border border-rule px-3 py-2 text-[14px]"
              required
            />
          </label>
          <label className="block text-[13px] text-slate">
            Effective date
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => setEffectiveDate(e.target.value)}
              className="mt-1 block w-full border border-rule px-3 py-2 text-[14px]"
              required
            />
          </label>
          <label className="block text-[13px] text-slate">
            Slug
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="mt-1 block w-full border border-rule px-3 py-2 text-[14px]"
            />
          </label>
          <label className="block text-[13px] text-slate">
            PDF file
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-[14px]"
              required
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="border border-navy-900 bg-navy-900 px-5 py-2 text-[14px] font-medium text-bone hover:bg-navy-700 disabled:opacity-50"
          >
            {busy ? "Ingesting…" : "Upload & ingest"}
          </button>
          {status && <p className="text-[13px] text-slate">{status}</p>}
        </form>
      </main>
    </div>
  );
}
