"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authFetch, getUserToken } from "@/lib/auth-client";

interface AuditRecord {
  message: { id: string; content: string; mode: "A" | "B" | "mixed" | null; created_at: string };
  question: { content: string; created_at: string } | null;
  conversation: { id: string; state_code: string; title: string };
  state: { state_name: string; association_name: string } | null;
  chunks: {
    id: string;
    bylaw_id: string;
    title: string;
    body: string;
    effective_date: string;
    source_doc: string;
    source_page: number | null;
  }[];
  integrityHash: string;
}

export default function AuditPage() {
  const params = useParams<{ messageId: string }>();
  const router = useRouter();
  const [record, setRecord] = useState<AuditRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    authFetch(`/api/audit/${params.messageId}`)
      .then(async (r) => {
        if (r.status === 401) {
          router.push(`/login?next=${encodeURIComponent(window.location.pathname)}`);
          return null;
        }
        if (!r.ok) {
          setError("This record doesn't exist, or you don't have access to it.");
          return null;
        }
        return r.json();
      })
      .then((d) => d && setRecord(d))
      .catch(() => setError("Something went wrong loading this record."));
  }, [params.messageId, router]);

  function copyHash() {
    if (!record) return;
    navigator.clipboard.writeText(record.integrityHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="min-h-screen bg-bone px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between">
          <Link href="/coach" className="text-[13px] text-slate hover:text-navy-900">
            &larr; Back to chat
          </Link>
          {getUserToken() && (
            <button onClick={() => window.print()} className="text-[13px] text-slate hover:text-navy-900">
              Print / save PDF
            </button>
          )}
        </div>

        {error && <p className="mt-10 border border-red bg-white p-6 text-[14px] text-red">{error}</p>}

        {record && (
          <div className="mt-6 border border-navy-900 bg-white">
            <div className="border-b border-rule bg-navy-900 px-6 py-5 text-bone">
              <p className="eyebrow text-[#E8A2A9]">Permanent record</p>
              <h1 className="mt-1 font-serif text-xl font-semibold sm:text-2xl">
                {record.state?.association_name ?? record.conversation.state_code.toUpperCase()}
              </h1>
              <p className="mt-1 text-[13px] text-bone/70">
                {new Date(record.message.created_at).toLocaleString(undefined, {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div className="px-6 py-6">
              {record.question && (
                <div>
                  <p className="eyebrow text-slate">Question asked</p>
                  <p className="mt-2 whitespace-pre-wrap text-[15px] text-ink">{record.question.content}</p>
                </div>
              )}

              <div className="mt-6 border-t border-rule pt-6">
                <p className="eyebrow text-slate">
                  Coach Eli&rsquo;s answer {record.message.mode === "A" && "— grounded in cited bylaws below"}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-[15px] text-ink">
                  {record.message.content.replace(/\[\[cite:[a-f0-9-]+\]\]/g, "")}
                </p>
              </div>

              {record.chunks.length > 0 && (
                <div className="mt-6 border-t border-rule pt-6">
                  <p className="eyebrow text-slate">Bylaws cited</p>
                  <div className="mt-3 space-y-6">
                    {record.chunks.map((c, i) => (
                      <div key={c.id}>
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-serif text-[15px] font-semibold text-navy-900">
                            §{i + 1} — {c.bylaw_id}: {c.title}
                          </p>
                          <span className="text-[12px] text-slate">Effective {c.effective_date}</span>
                        </div>
                        <blockquote className="bylaw-quote mt-2 whitespace-pre-wrap text-ink">{c.body}</blockquote>
                        <a
                          href={c.source_doc}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-[12px] text-navy-700 underline"
                        >
                          Source PDF{c.source_page ? ` — page ${c.source_page}` : ""}
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-6 border-t border-rule pt-4">
                <p className="text-[11px] uppercase tracking-wide text-slate">Integrity hash (SHA-256)</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <code className="break-all font-mono text-[11px] text-slate">{record.integrityHash}</code>
                  <button
                    onClick={copyHash}
                    className="shrink-0 border border-rule px-2 py-0.5 text-[11px] text-slate hover:border-navy-900 hover:text-navy-900 print:hidden"
                  >
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
                <p className="mt-1 text-[11px] text-slate">
                  Computed from this exact answer and every bylaw text cited in it. If this record is ever
                  disputed, regenerate the hash from this page — a match confirms nothing here has changed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
