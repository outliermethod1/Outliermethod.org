import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import { Footer } from "../../components/Sections";

export const metadata = {
  title: "General Disclaimer — Outlier Method",
  description:
    "Outlier Method provides general outdoor and gear information for educational and entertainment purposes — not professional, legal, or safety advice.",
};

export default function Disclaimer() {
  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">General Disclaimer</h1>
        </div>

        <div className="post">
          <div className="post-body">
            <p>
              Outlier Method provides general outdoor and gear information for
              educational and entertainment purposes only. Nothing on this site is
              professional, legal, or safety advice, and it shouldn&apos;t be treated as
              a substitute for it.
            </p>
            <p>
              Hunting and fishing regulations, seasons, and license requirements vary by
              state and change over time. Always verify current rules directly with your
              state wildlife agency before you go — the links in our State Field Guides
              point to official sources for exactly that reason.
            </p>
            <p>
              Amos Flint and Eleanor Crowe are AI-powered guides. They&apos;re designed
              to give helpful, field-grounded answers, but they can make mistakes.
              Verify anything safety-critical independently before you rely on it.
            </p>
            <p>
              Our gear recommendations and Outlier Scores reflect genuine testing and
              honest opinion — not guarantees. Use all equipment, especially firearms
              and blades, at your own risk and in accordance with the manufacturer&apos;s
              instructions.
            </p>
            <p>
              Outlier Method and its contributors aren&apos;t liable for outcomes
              resulting from following content on this site.
            </p>
            <p>
              Questions? Call us at{" "}
              <a href="tel:+17192701280">(719) 270-1280</a>. For how we handle affiliate
              links and commissions, see our{" "}
              <a href="/disclosure">Affiliate Disclosure</a>.
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
