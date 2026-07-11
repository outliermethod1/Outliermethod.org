import Ticker from "../components/Ticker";
import Header from "../components/Header";
import AskBar from "../components/AskBar";
import Hero from "../components/Hero";
import LiveField from "../components/LiveField";
import Campfire from "../components/Campfire";
import PathsRow from "../components/PathsRow";
import FieldAudio from "../components/FieldAudio";
import { Manifesto, ValueStrip, Categories, StateGuides, Footer } from "../components/Sections";

export default function Home() {
  return (
    <>
      <Ticker />
      <Header />
      <div id="ask">
        <AskBar />
      </div>
      <div className="wrap">
        <Hero />
        <Manifesto />
        <ValueStrip />
        <LiveField />
        <Campfire />
        <Categories />
        <StateGuides />
        <PathsRow />
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
