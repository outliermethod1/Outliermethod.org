import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import { Footer } from "../../components/Sections";
import { STATES } from "../../lib/states";

export const metadata = {
  title: "State Field Guides — Outlier Method",
  description:
    "Hunting and public land guides for Colorado, Wyoming, Montana, Idaho, and Utah — official sources and straight talk, one page per state.",
};

export default function StatesIndex() {
  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">State Field Guides</h1>
          <p>
            Everything you need for your state, one page — official sources, straight
            talk, no guesswork.
          </p>
        </div>
        <div className="states-grid" style={{ marginBottom: 60 }}>
          {Object.entries(STATES).map(([slug, state]) => (
            <a key={slug} href={`/states/${slug}`} className="state-card">
              <div className="st-abbr">{state.abbr}</div>
              <h3 className="display">{state.name}</h3>
              <p>Wildlife · Public Land · Camping · Fishing</p>
              <div className="st-tags">{state.publicLandActs}</div>
            </a>
          ))}
        </div>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
