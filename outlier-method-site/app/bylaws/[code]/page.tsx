"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { CATEGORY_LABELS } from "@/lib/categories";
import type { Category } from "@/lib/db/types";

interface StateInfo {
  state_code: string;
  state_name: string;
  association_name: string;
  eligibility_contact_name: string | null;
  eligibility_contact_phone: string | null;
  eligibility_contact_email: string | null;
}

interface Chunk {
  id: string;
  bylaw_id: string;
  title: string;
  body: string;
  effective_date: string;
  category: Category;
  source_doc: string;
  source_page: number | null;
}

export default function StateBylawsPage() {
  const params = useParams<{ code: string }>();
  const [state, setState] = useState<StateInfo | null>(null);
  const [chunks, setChunks] = useState<Chunk[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/states/${params.code}/bylaws`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFound(true);
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d) return;
        setState(d.state);
        setChunks(d.chunks ?? []);
      })
      .catch(() => setNotFound(true));
  }, [params.code]);

  useEffect(() => {
    if (chunks.length === 0) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    const el = document.getElementById(hash);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.classList.add("bg-red-tint");
    }
  }, [chunks]);

  const grouped = chunks.reduce<Record<string, Chunk[]>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <Link href="/bylaws" className="text-[13px] text-slate hover:text-navy-900">
            &larr; All states
          </Link>

          {notFound && <p className="mt-8 text-sm text-slate">State not found or not yet configured.</p>}

          {state && (
            <>
              <p className="mt-4 eyebrow text-red">{state.state_name}</p>
              <h1 className="mt-2 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
                {state.association_name}
              </h1>
              {state.eligibility_contact_name && (
                <p className="mt-3 text-[13px] text-slate">
                  Eligibility contact: {state.eligibility_contact_name}
                  {state.eligibility_contact_phone && <> &middot; {state.eligibility_contact_phone}</>}
                  {state.eligibility_contact_email && <> &middot; {state.eligibility_contact_email}</>}
                </p>
              )}

              {chunks.length === 0 && (
                <p className="mt-10 text-[15px] text-slate">
                  No bylaws on file yet for {state.state_name}. Ask Coach Eli about operations questions
                  in the meantime, or check back once the handbook is uploaded.
                </p>
              )}

              {chunks.length > 0 && (
                <p className="mt-8 max-w-2xl text-[13px] text-slate">
                  Every entry links straight to {state.association_name}&rsquo;s own published document —
                  the authoritative copy stays with them, not a hosted duplicate here.
                </p>
              )}

              <div className="mt-10 space-y-12">
                {Object.entries(grouped).map(([category, items]) => (
                  <section key={category}>
                    <h2 className="eyebrow border-b border-rule pb-2 text-navy-900">
                      {CATEGORY_LABELS[category as Category] ?? category}
                    </h2>
                    <div className="mt-6 divide-y divide-rule border-b border-rule">
                      {items.map((c) => (
                        <a
                          key={c.id}
                          id={`chunk-${c.id}`}
                          href={c.source_doc}
                          target="_blank"
                          rel="noreferrer"
                          className="scroll-mt-24 flex flex-wrap items-baseline justify-between gap-2 py-4 transition-colors hover:bg-red-tint"
                        >
                          <h3 className="font-serif text-lg font-semibold text-navy-900">
                            {c.bylaw_id} &mdash; {c.title}
                            <span className="ml-2 text-[12px] font-sans font-normal text-navy-700">
                              View source{c.source_page ? ` (p. ${c.source_page})` : ""} &rarr;
                            </span>
                          </h3>
                          <span className="text-[12px] text-slate">Effective {c.effective_date}</span>
                        </a>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
