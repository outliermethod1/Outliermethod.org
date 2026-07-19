import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import { Footer } from "../../components/Sections";

export const metadata = {
  title: "Why Trust Us — Outlier Method",
  description:
    "Field-tested means field-tested, the Outlier Score is never for sale, and one accountable human signs off on everything we publish.",
};

export default function WhyTrustUsPage() {
  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <article className="post">
          <h1 className="display">Why Trust Us</h1>
          <div className="post-body">
            <h2>Field-tested means field-tested</h2>
            <p>
              Before we write about a piece of gear, it gets used — at altitude, in
              weather, on real hunts. Not unboxed on a kitchen table, not skimmed from
              a spec sheet. If it hasn&apos;t been carried, worn, soaked, dropped, or
              leaned on when it mattered, we don&apos;t have an opinion on it yet, and
              we won&apos;t pretend to.
            </p>

            <h2>The Outlier Score is never for sale</h2>
            <p>
              No manufacturer pays for placement here. Affiliate commissions never
              change a verdict — the score is settled in the field before any link
              exists. And when something fails on us, we say so, plainly, because a
              review that can&apos;t say &quot;this broke&quot; isn&apos;t a review.
            </p>

            <h2>One accountable human</h2>
            <p>
              Ryan Lynch&apos;s name is on the door. Every recommendation on this site
              ships under his judgment — no anonymous editorial board, no rotating
              cast of freelancers you&apos;ll never hear from again. If we got
              something wrong, you know exactly who to hold to it.
            </p>

            <h2>What we don&apos;t do</h2>
            <p>
              No coupon-farming. No rewriting press releases and calling it a review.
              No listing gear we haven&apos;t handled. If that means we cover less
              ground than the big content mills, fine — we&apos;d rather be right
              about less than vague about everything.
            </p>

            <p>
              <a href="/disclosure">Read our affiliate disclosure →</a>
            </p>
          </div>
        </article>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
