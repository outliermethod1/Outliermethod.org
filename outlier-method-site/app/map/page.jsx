import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import { Footer } from "../../components/Sections";
import OutlierMapLoader from "../../components/OutlierMapLoader";

export const metadata = {
  title: "The Outlier Map — Outlier Method",
  description:
    "An interactive map of live cams, state field guides, and public land — click anywhere to plan your next trip.",
};

export default function MapPage() {
  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">The Outlier Map</h1>
          <p>
            Live cams, state field guides, and public land — one map. Click anywhere to
            check trip conditions for that spot.
          </p>
        </div>
      </div>
      <OutlierMapLoader />
      <Footer />
      <FieldAudio />
    </>
  );
}
