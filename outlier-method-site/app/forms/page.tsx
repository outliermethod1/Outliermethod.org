"use client";

import { useEffect, useMemo, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getUserToken } from "@/lib/auth-client";

type FormLevel = "high_school" | "college";

interface FormTemplate {
  id: string;
  title: string;
  level: FormLevel;
  category: string;
  body: string;
}

function tokenParam(): string {
  const token = getUserToken();
  return token ? `&token=${encodeURIComponent(token)}` : "";
}

function TemplateCard({ t }: { t: FormTemplate }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(t.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="border border-rule bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-red-tint"
      >
        <span className="font-serif text-[16px] font-semibold text-navy-900">{t.title}</span>
        <span className="text-slate">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="border-t border-rule px-5 py-4">
          <pre className="whitespace-pre-wrap font-mono text-[13px] leading-relaxed text-ink">{t.body}</pre>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={copy}
              className="border border-navy-900 px-4 py-2 text-[13px] font-medium text-navy-900 hover:bg-navy-900 hover:text-white"
            >
              {copied ? "Copied" : "Copy to clipboard"}
            </button>
            <a
              href={`/api/forms/${t.id}/export?format=pdf${tokenParam()}`}
              className="border border-rule px-4 py-2 text-[13px] font-medium text-slate hover:border-navy-900 hover:text-navy-900"
            >
              Download PDF
            </a>
            <a
              href={`/api/forms/${t.id}/export?format=docx${tokenParam()}`}
              className="border border-rule px-4 py-2 text-[13px] font-medium text-slate hover:border-navy-900 hover:text-navy-900"
            >
              Download DOCX
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FormsPage() {
  const [templates, setTemplates] = useState<FormTemplate[]>([]);
  const [level, setLevel] = useState<FormLevel>("high_school");

  useEffect(() => {
    fetch("/api/forms")
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates ?? []));
  }, []);

  const filtered = useMemo(() => templates.filter((t) => t.level === level), [templates, level]);
  const grouped = filtered.reduce<Record<string, FormTemplate[]>>((acc, t) => {
    (acc[t.category] ??= []).push(t);
    return acc;
  }, {});

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <p className="eyebrow text-red">Forms &amp; Documents</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
            Starter templates
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] text-slate">
            Ready-to-copy documents for the paperwork every AD needs. Want one tailored to your situation
            instead? Ask Coach Eli directly &mdash; he can draft any of these from scratch, filled in for your
            specifics.
          </p>

          <div className="mt-8 inline-flex border border-navy-900">
            <button
              onClick={() => setLevel("high_school")}
              className={`px-5 py-2 text-[14px] font-medium ${
                level === "high_school" ? "bg-navy-900 text-white" : "bg-white text-navy-900 hover:bg-red-tint"
              }`}
            >
              High School
            </button>
            <button
              onClick={() => setLevel("college")}
              className={`border-l border-navy-900 px-5 py-2 text-[14px] font-medium ${
                level === "college" ? "bg-navy-900 text-white" : "bg-white text-navy-900 hover:bg-red-tint"
              }`}
            >
              College
            </button>
          </div>

          {filtered.length === 0 && (
            <p className="mt-10 text-[15px] text-slate">No templates loaded for this level yet.</p>
          )}

          <div className="mt-10 space-y-10">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <h2 className="eyebrow border-b border-rule pb-2 text-navy-900">{category}</h2>
                <div className="mt-4 space-y-3">
                  {items.map((t) => (
                    <TemplateCard key={t.id} t={t} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
