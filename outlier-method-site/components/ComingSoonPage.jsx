import Ticker from "./Ticker";
import Header from "./Header";
import FieldAudio from "./FieldAudio";
import { Footer } from "./Sections";

export default function ComingSoonPage({ title, children }) {
  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">{title}</h1>
        </div>
        <div className="post">
          <div className="post-body">
            {children}
            <p>
              <a href="/">← Back to the homepage</a>
              <br />
              <a href="/blog">Read the Blog →</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
