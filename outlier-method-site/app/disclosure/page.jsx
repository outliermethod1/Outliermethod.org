import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import { Footer } from "../../components/Sections";

export const metadata = {
  title: "Affiliate Disclosure — Outlier Method",
  description: "How Outlier Method handles affiliate links, commissions, and reviews.",
};

export default function Disclosure() {
  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">Affiliate Disclosure</h1>
        </div>

        <div className="post">
          <div className="post-body">
            <p>
              Outlier Method participates in affiliate programs. That means some of the
              links on this site — on gear we recommend, in articles, in the Trusted
              Products picks — may earn us a small commission if you make a purchase
              through them, at no extra cost to you.
            </p>
            <p>
              We only recommend gear we&apos;d stake a hunt, a hike, or a camping trip on
              ourselves. If it wouldn&apos;t survive a season in our hands, it doesn&apos;t
              get recommended here, commission or not.
            </p>
            <p>
              Our reviews and Outlier Scores are never for sale. No brand pays for a good
              score, a placement, or a mention. If something&apos;s overpriced or
              overrated, we&apos;ll say so.
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
