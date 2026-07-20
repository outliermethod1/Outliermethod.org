import Ticker from "../../components/Ticker";
import Header from "../../components/Header";
import FieldAudio from "../../components/FieldAudio";
import { Footer } from "../../components/Sections";
import { ACTIVITIES } from "../../lib/tripPlanner";

export const metadata = {
  title: "Trip Planner — Outlier Method",
  description:
    "Know before you go. Pick your trip, tell us where, get real conditions and a straight read from someone who's been there.",
};

export default function TripPlannerIndex() {
  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <div className="blog-head">
          <h1 className="display">Trip Planner</h1>
          <p>
            Know before you go. Pick your trip, tell us where, get real conditions and
            a straight read from someone who&apos;s been there.
          </p>
        </div>

        <div className="trip-grid">
          {Object.values(ACTIVITIES).map((activity) => (
            <a key={activity.key} href={`/trip-planner/${activity.key}`} className="trip-card">
              <div className="trip-icon">{activity.icon}</div>
              <h2 className="display">{activity.label}</h2>
              <p>{activity.blurb}</p>
              <span className="b-read">Check Conditions →</span>
            </a>
          ))}
        </div>
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
