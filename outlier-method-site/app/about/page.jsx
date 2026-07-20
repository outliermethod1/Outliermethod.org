import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import AuthorAvatar from "../../components/AuthorAvatar";
import { Manifesto, Footer } from "../../components/Sections";
import { resolveAuthor } from "../../lib/authors";

export const metadata = {
  title: "About — Outlier Method",
  description: "Who's behind Outlier Method, and why the outdoors belongs to everyone.",
};

export default function About() {
  const ryan = resolveAuthor("ryan");
  const jesse = resolveAuthor("jesse");

  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">About Outlier Method</h1>
        </div>

        <Manifesto />

        <div className="post">
          <div className="about-section">
            <h2 className="display">Who&apos;s Behind This</h2>
            <div className="author-box">
              <AuthorAvatar author={ryan} className="avatar-64" />
              <div>
                <div className="author-box-name">{ryan.name}</div>
                <div className="author-box-role">{ryan.role}</div>
                <p className="author-box-bio">
                  Outlier Method is Ryan&apos;s build, his standard, and his field-testing.
                  Every product pick, every gear review, and every word on this site
                  ships under his judgment — nothing goes up that he wouldn&apos;t stake
                  his own trip on.
                </p>
                <p className="author-box-bio" style={{ marginTop: 10 }}>
                  <a href="tel:+17192701280" style={{ color: "var(--moss-bright)" }}>
                    📞 (719) 270-1280
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div className="about-section">
            <h2 className="display">The Staff</h2>
            <div className="author-box">
              <AuthorAvatar author={jesse} className="avatar-64" />
              <div>
                <div className="author-box-name">{jesse.name}</div>
                <div className="author-box-role">{jesse.role}</div>
                <p className="author-box-bio">{jesse.bio}</p>
              </div>
            </div>
            <p className="about-note" style={{ marginTop: 16 }}>
              More field writers are joining the crew as Outlier Method grows.
            </p>
          </div>

          <div className="about-section">
            <h2 className="display">Our Guides</h2>
            <p className="about-note">
              Amos Flint and Eleanor Crowe are crafted guides, brought to life with AI.
              The advice they give is real and field-grounded, reviewed against the same
              standard as everything else on this site — but their beards, their
              shotguns, and their campfire stories are illustrative. Think of them as
              the friendliest way to get straight answers, not as two more people we
              hired.
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
