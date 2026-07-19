import { notFound } from "next/navigation";
import Ticker from "../../../components/Ticker";
import Header from "../../../components/Header";
import FieldAudio from "../../../components/FieldAudio";
import { Footer } from "../../../components/Sections";
import { getState, getStateSlugs } from "../../../lib/states";

export function generateStaticParams() {
  return getStateSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const state = getState(params.slug);
  if (!state) return {};

  return {
    title: `${state.name} Hunting & Public Land Guide — Outlier Method`,
    description: `${state.name} hunting and public land, the Outlier way — official ${state.name} agency sources, regulations links, and plain-English orientation. ${state.publicLandActs}.`,
  };
}

export default function StatePage({ params }) {
  const state = getState(params.slug);
  if (!state) notFound();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://outliermethod.org" },
      { "@type": "ListItem", position: 2, name: "State Guides", item: "https://outliermethod.org/states" },
      {
        "@type": "ListItem",
        position: 3,
        name: state.name,
        item: `https://outliermethod.org/states/${params.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Ticker />
      <Header />
      <div className="wrap">
        <article className="post">
          <a href="/states" className="post-back">
            ← All State Guides
          </a>
          <div className="state-head">
            <div className="st-abbr">{state.abbr}</div>
            <div>
              <h1 className="display">{state.name}</h1>
              <p className="state-stat">{state.publicLandActs}</p>
            </div>
          </div>

          <div className="post-body">
            <h2>Official Sources</h2>
            <p className="state-note">
              Regulations live with the state, and they change. Whatever you read
              anywhere else — including here — always verify current seasons, rules,
              and deadlines at these official pages.
            </p>
            <ul className="agency-list">
              {state.agencies.map((agency) => (
                <li key={agency.label + agency.url}>
                  <a href={agency.url} target="_blank" rel="noopener noreferrer">
                    {agency.label} ↗
                  </a>
                </li>
              ))}
            </ul>

            <h2>The Outlier Take</h2>
            {state.outlierTake ? (
              state.outlierTake.map((paragraph, i) => <p key={i}>{paragraph}</p>)
            ) : (
              <p className="state-note">
                Our field notes for {state.name} are being written — the official
                links above are current and complete.
              </p>
            )}

            <h2>Watch the Wild</h2>
            <p>
              {state.camName
                ? `The ${state.camName} cam on our homepage streams from ${state.name} country — `
                : "Live wildlife cams stream on our homepage — "}
              <a href="/#live">watch the cams →</a>
            </p>
          </div>
        </article>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
