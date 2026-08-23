"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

interface StateRow {
  state_code: string;
  state_name: string;
  association_name: string;
  eligibility_contact_name: string | null;
  eligibility_contact_phone: string | null;
  eligibility_contact_email: string | null;
}

interface WatchedUrlRow {
  id: string;
  state_code: string;
  url: string;
  label: string;
  last_status: string | null;
  last_checked_at: string | null;
}

export default function AdminConfigPage() {
  const [states, setStates] = useState<StateRow[]>([]);
  const [watchedUrls, setWatchedUrls] = useState<WatchedUrlRow[]>([]);
  const [form, setForm] = useState<StateRow>({
    state_code: "",
    state_name: "",
    association_name: "",
    eligibility_contact_name: "",
    eligibility_contact_phone: "",
    eligibility_contact_email: "",
  });
  const [urlForm, setUrlForm] = useState({ state_code: "", url: "", label: "" });

  function load() {
    fetch("/api/admin/config")
      .then((r) => r.json())
      .then((d) => {
        setStates(d.states ?? []);
        setWatchedUrls(d.watchedUrls ?? []);
      });
  }
  useEffect(load, []);

  async function saveState(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "state", ...form }),
    });
    setForm({
      state_code: "",
      state_name: "",
      association_name: "",
      eligibility_contact_name: "",
      eligibility_contact_phone: "",
      eligibility_contact_email: "",
    });
    load();
  }

  async function addUrl(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/admin/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "watched_url", ...urlForm }),
    });
    setUrlForm({ state_code: "", url: "", label: "" });
    load();
  }

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-serif text-2xl font-semibold text-navy-900">Per-state configuration</h1>

        <section className="mt-8">
          <h2 className="font-serif text-lg font-semibold text-navy-900">States</h2>
          <div className="mt-3 divide-y divide-rule border border-rule bg-white">
            {states.map((s) => (
              <div key={s.state_code} className="px-4 py-3 text-[14px]">
                <span className="font-medium text-navy-900">{s.association_name}</span>{" "}
                <span className="text-slate">
                  ({s.state_code.toUpperCase()}) — {s.eligibility_contact_name ?? "no contact set"}
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={saveState} className="mt-4 grid grid-cols-2 gap-3 border border-rule bg-white p-5">
            {(
              [
                ["state_code", "State code (e.g. co)"],
                ["state_name", "State name"],
                ["association_name", "Association name"],
                ["eligibility_contact_name", "Contact name"],
                ["eligibility_contact_phone", "Contact phone"],
                ["eligibility_contact_email", "Contact email"],
              ] as [keyof StateRow, string][]
            ).map(([key, label]) => (
              <label key={key} className="text-[13px] text-slate">
                {label}
                <input
                  value={form[key] ?? ""}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  className="mt-1 block w-full border border-rule px-3 py-2 text-[14px]"
                  required={key === "state_code" || key === "state_name" || key === "association_name"}
                />
              </label>
            ))}
            <button
              type="submit"
              className="col-span-2 mt-1 border border-navy-900 bg-navy-900 px-4 py-2 text-[14px] font-medium text-bone hover:bg-navy-700"
            >
              Save state
            </button>
          </form>
        </section>

        <section className="mt-10">
          <h2 className="font-serif text-lg font-semibold text-navy-900">Watched URLs</h2>
          <div className="mt-3 divide-y divide-rule border border-rule bg-white">
            {watchedUrls.map((u) => (
              <div key={u.id} className="flex items-center justify-between px-4 py-3 text-[14px]">
                <div>
                  <span className="font-medium text-navy-900">{u.label}</span>{" "}
                  <span className="text-slate">({u.state_code.toUpperCase()})</span>
                  <p className="text-[12px] text-slate">{u.url}</p>
                </div>
                <span className="text-[12px] text-slate">{u.last_status ?? "never checked"}</span>
              </div>
            ))}
          </div>

          <form onSubmit={addUrl} className="mt-4 grid grid-cols-3 gap-3 border border-rule bg-white p-5">
            <label className="text-[13px] text-slate">
              State code
              <input
                value={urlForm.state_code}
                onChange={(e) => setUrlForm((p) => ({ ...p, state_code: e.target.value }))}
                className="mt-1 block w-full border border-rule px-3 py-2 text-[14px]"
                required
              />
            </label>
            <label className="col-span-2 text-[13px] text-slate">
              Label
              <input
                value={urlForm.label}
                onChange={(e) => setUrlForm((p) => ({ ...p, label: e.target.value }))}
                className="mt-1 block w-full border border-rule px-3 py-2 text-[14px]"
                required
              />
            </label>
            <label className="col-span-3 text-[13px] text-slate">
              URL
              <input
                value={urlForm.url}
                onChange={(e) => setUrlForm((p) => ({ ...p, url: e.target.value }))}
                className="mt-1 block w-full border border-rule px-3 py-2 text-[14px]"
                required
              />
            </label>
            <button
              type="submit"
              className="col-span-3 border border-navy-900 bg-navy-900 px-4 py-2 text-[14px] font-medium text-bone hover:bg-navy-700"
            >
              Add watched URL
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
