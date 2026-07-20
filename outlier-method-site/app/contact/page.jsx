import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import { Footer } from "../../components/Sections";

export const metadata = {
  title: "Contact — Outlier Method",
  description: "Get in touch with Outlier Method — questions, gear tips, or something we should test.",
};

export default function Contact() {
  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">Contact</h1>
        </div>

        <div className="post">
          <div className="post-body">
            <p>Questions, gear tips, or something we should test? Reach out.</p>
            <p>
              Phone: <a href="tel:+17192701280">(719) 270-1280</a>
            </p>
            <p>
              Email: <a href="mailto:hello@outliermethod.org">hello@outliermethod.org</a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
