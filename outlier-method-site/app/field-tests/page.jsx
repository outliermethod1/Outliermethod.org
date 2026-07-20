import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import AuthorAvatar from "../../components/AuthorAvatar";
import OutlierScore from "../../components/OutlierScore";
import { Footer } from "../../components/Sections";
import { getAllFieldTests } from "../../lib/fieldTests";

export const metadata = {
  title: "Field Tests — Outlier Method",
  description:
    "Gear we've actually used, scored with the Outlier Score — durability, value, repairability, and beginner-friendliness. No sponsorships, no fluff.",
};

export default function FieldTestsIndex() {
  const tests = getAllFieldTests();

  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">Field Tests</h1>
          <p>
            Gear we&apos;ve actually used — in the field, not just out of the box. If
            it&apos;s here, we&apos;d stake a hunt on it.
          </p>
          <p className="outlier-standard">
            Everything here has real field time behind it. We tell you exactly how much
            — and exactly who should skip it — because that&apos;s the only way a
            recommendation means anything.
          </p>
        </div>

        {tests.length === 0 ? (
          <p className="blog-empty">No field tests yet. Check back soon.</p>
        ) : (
          <div className="blog-grid field-grid">
            {tests.map((test) => (
              <a key={test.slug} href={`/field-tests/${test.slug}`} className="blog-card field-card">
                <div className="ft-category">{test.category}</div>
                <h2 className="display">{test.title}</h2>
                <div className="b-author">
                  <AuthorAvatar author={test.author} className="avatar-28" />
                  <span>{test.author.name}</span>
                </div>
                <OutlierScore scores={test.scores} />
                <p className="ft-verdict">&ldquo;{test.verdict}&rdquo;</p>
                <span className="b-read">Read the Field Test →</span>
              </a>
            ))}
          </div>
        )}
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
