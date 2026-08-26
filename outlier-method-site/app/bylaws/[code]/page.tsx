import Link from "next/link";
import { notFound as nextNotFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { WaitlistForm } from "@/components/WaitlistForm";
import { CATEGORY_LABELS } from "@/lib/categories";
import { getState } from "@/lib/db/states";
import { listCurrentChunksForState } from "@/lib/db/chunks";
import type { Category } from "@/lib/db/types";

export async function generateMetadata({ params }: { params: { code: string } }) {
  const state = await getState(params.code);
  if (!state) return {};
  return {
    title: `${state.association_name} Eligibility Bylaws — Cited & Dated`,
    description: `Current eligibility bylaws for ${state.state_name} (${state.association_name}), with effective dates and citations. Superseded text is never shown as current.`,
  };
}

export default async function StateBylawsPage({ params }: { params: { code: string } }) {
  const state = await getState(params.code);
  if (!state) nextNotFound();

  const chunks = await listCurrentChunksForState(params.code);
  const grouped = chunks.reduce<Record<string, typeof chunks>>((acc, c) => {
    (acc[c.category] ??= []).push(c);
    return acc;
  }, {});

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: chunks.map((c) => ({
      "@type": "Question",
      name: `${state!.association_name}: ${c.bylaw_id} — ${c.title}`,
      acceptedAnswer: { "@type": "Answer", text: c.body },
    })),
  };

  return (
    <>
      <SiteHeader />
      {chunks.length > 0 && (
        // eslint-disable-next-line react/no-danger
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      )}
      <main className="min-h-screen bg-bone">
        <div className="mx-auto max-w-4xl px-6 py-16 sm:py-20">
          <Link href="/bylaws" className="text-[13px] text-slate hover:text-navy-900">
            &larr; All states
          </Link>

          <p className="mt-4 eyebrow text-red">{state!.state_name}</p>
          <h1 className="mt-2 font-serif text-3xl font-semibold text-navy-900 sm:text-4xl">
            {state!.association_name}
          </h1>
          {state!.eligibility_contact_name && (
            <p className="mt-3 text-[13px] text-slate">
              Eligibility contact: {state!.eligibility_contact_name}
              {state!.eligibility_contact_phone && <> &middot; {state!.eligibility_contact_phone}</>}
              {state!.eligibility_contact_email && <> &middot; {state!.eligibility_contact_email}</>}
            </p>
          )}

          {chunks.length === 0 && (
            <div className="mt-10 border border-rule bg-white p-6">
              <p className="text-[15px] text-slate">
                No bylaws indexed yet for {state!.state_name}. Ask Coach Eli about operations questions
                in the meantime — tell us you need this state and it moves up the build order.
              </p>
              <WaitlistForm stateCode={state!.state_code} stateName={state!.state_name} />
            </div>
          )}

          {chunks.length > 0 && (
            <p className="mt-8 max-w-2xl text-[13px] text-slate">
              Indexed from {state!.association_name}&rsquo;s own published handbook. Superseded rules are
              never shown here as current — every section below is the version in force today.
            </p>
          )}

          <div className="mt-10 space-y-14">
            {Object.entries(grouped).map(([category, items]) => (
              <section key={category}>
                <h2 className="eyebrow border-b border-rule pb-2 text-navy-900">
                  {CATEGORY_LABELS[category as Category] ?? category}
                </h2>
                <div className="mt-6 space-y-10">
                  {items.map((c) => (
                    <div key={c.id} id={`chunk-${c.id}`} className="scroll-mt-24">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-serif text-lg font-semibold text-navy-900">
                          {c.bylaw_id} &mdash; {c.title}
                        </h3>
                        <span className="text-[12px] text-slate">Effective {c.effective_date}</span>
                      </div>
                      <blockquote className="bylaw-quote mt-3 whitespace-pre-wrap text-ink">{c.body}</blockquote>
                      <div className="mt-2 flex flex-wrap items-center gap-4">
                        <a
                          href={c.source_doc}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[12px] text-navy-700 underline"
                        >
                          Source PDF{c.source_page ? ` — page ${c.source_page}` : ""}
                        </a>
                        <Link
                          href={`/coach?state=${state!.state_code}&ask=${encodeURIComponent(
                            `Follow-up on ${c.bylaw_id}: `
                          )}`}
                          className="text-[12px] text-navy-700 underline"
                        >
                          Ask a follow-up question
                        </Link>
                      </div>
                      <div className="mt-2 max-w-xs">
                        <WaitlistForm
                          stateCode={state!.state_code}
                          bylawId={c.bylaw_id}
                          label={`Notify me if ${c.bylaw_id} amends`}
                        />
                      </div>
                    </div>
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
