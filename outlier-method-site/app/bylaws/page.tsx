"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import type { StateOption } from "@/lib/states-client";

export default function BylawLibraryPage() {
  const [states, setStates] = useState<StateOption[]>([]);

  useEffect(() => {
    fetch("/api/states")
      .then((r) => (r.ok ? r.json() : { states: [] }))
      .then((d) => setStates(d.states ?? []))
      .catch(() => setStates([]));
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
          <p className="eyebrow text-red">Bylaw Library</p>
          <h1 className="mt-3 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
            Browse by state
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] text-slate">
            Every current bylaw section on file, by state association, with its effective date and
            citation. Superseded text is never shown here as current.
          </p>

          {states.length === 0 && <p className="mt-10 text-sm text-slate">Loading states&hellip;</p>}

          <div className="mt-10 grid grid-cols-1 gap-px border border-rule bg-rule sm:grid-cols-2 md:grid-cols-3">
            {states.map((s) => (
              <Link
                key={s.state_code}
                href={`/bylaws/${s.state_code}`}
                className="bg-white p-5 hover:bg-red-tint"
              >
                <p className="font-serif text-lg font-semibold text-navy-900">{s.state_name}</p>
                <p className="mt-1 text-[13px] text-slate">{s.association_name}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
