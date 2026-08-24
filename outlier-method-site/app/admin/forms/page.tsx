"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/AdminNav";

type FormLevel = "high_school" | "college";

interface FormTemplate {
  id: string;
  title: string;
  level: FormLevel;
  category: string;
  body: string;
}

const BLANK = { title: "", level: "high_school" as FormLevel, category: "", body: "" };

export default function AdminFormsPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState(BLANK);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    fetch("/api/admin/forms")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []));
  }

  useEffect(load, []);

  function startNew() {
    setEditingId(null);
    setDraft(BLANK);
    setStatus(null);
  }

  function startEdit(t: FormTemplate) {
    setEditingId(t.id);
    setDraft({ title: t.title, level: t.level, category: t.category, body: t.body });
    setStatus(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setStatus(null);
    const url = editingId ? `/api/admin/forms/${editingId}` : "/api/admin/forms";
    const res = await fetch(url, {
      method: editingId ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) {
      setStatus(editingId ? "Updated." : "Created.");
      startNew();
      load();
    } else {
      setStatus(data.error ?? "Save failed.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this template?")) return;
    await fetch(`/api/admin/forms/${id}`, { method: "DELETE" });
    if (editingId === id) startNew();
    load();
  }

  return (
    <div className="min-h-screen bg-bone">
      <AdminNav />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-serif text-2xl font-semibold text-navy-900">Form templates</h1>
        <p className="mt-2 text-sm text-slate">
          The starter documents shown at /forms. Split by High School and College since some documents differ
          by level.
        </p>

        <form onSubmit={save} className="mt-8 space-y-4 border border-rule bg-white p-6">
          <p className="eyebrow text-navy-900">{editingId ? "Edit template" : "New template"}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block text-[13px] text-slate">
              Title
              <input
                value={draft.title}
                onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                className="mt-1 block w-full border border-rule px-3 py-2 text-[14px]"
                required
              />
            </label>
            <label className="block text-[13px] text-slate">
              Category
              <input
                value={draft.category}
                onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))}
                placeholder="e.g. Transportation, Contracts, Evaluation"
                className="mt-1 block w-full border border-rule px-3 py-2 text-[14px]"
                required
              />
            </label>
          </div>
          <label className="block text-[13px] text-slate">
            Level
            <select
              value={draft.level}
              onChange={(e) => setDraft((d) => ({ ...d, level: e.target.value as FormLevel }))}
              className="mt-1 block w-full border border-rule bg-white px-3 py-2 text-[14px]"
            >
              <option value="high_school">High School</option>
              <option value="college">College</option>
            </select>
          </label>
          <label className="block text-[13px] text-slate">
            Body
            <textarea
              value={draft.body}
              onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
              rows={14}
              className="mt-1 block w-full border border-rule px-3 py-2 font-mono text-[13px]"
              required
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="border border-navy-900 bg-navy-900 px-5 py-2 text-[14px] font-medium text-white hover:bg-navy-700 disabled:opacity-50"
            >
              {editingId ? "Save changes" : "Create template"}
            </button>
            {editingId && (
              <button type="button" onClick={startNew} className="text-[13px] text-slate hover:text-navy-900">
                Cancel edit
              </button>
            )}
            {status && <span className="text-[13px] text-slate">{status}</span>}
          </div>
        </form>

        <h2 className="mt-10 eyebrow text-navy-900">All templates ({templates.length})</h2>
        <div className="mt-4 divide-y divide-rule border border-rule bg-white">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3 text-[13px]">
              <div>
                <span className="font-medium text-navy-900">{t.title}</span>
                <span className="ml-2 text-slate">
                  {t.level === "high_school" ? "High School" : "College"} &middot; {t.category}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => startEdit(t)} className="text-navy-900 hover:underline">
                  Edit
                </button>
                <button onClick={() => remove(t.id)} className="text-red hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {templates.length === 0 && <p className="px-4 py-6 text-center text-slate">No templates yet.</p>}
        </div>
      </main>
    </div>
  );
}
