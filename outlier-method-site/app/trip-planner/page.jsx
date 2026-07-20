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

export default function TripPlannerIndex({ searchParams }) {
  const lat = searchParams?.lat;
  const lng = searchParams?.lng;
  const locationQuery = lat && lng ? `?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}` : "";

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
          {locationQuery && (
            <p className="state-note" style={{ marginTop: 8 }}>
              Using the spot you picked on the map — choose an activity below.
            </p>
          )}
        </div>

        <div className="trip-grid">
          {Object.values(ACTIVITIES).map((activity) => (
            <a
              key={activity.key}
              href={`/trip-planner/${activity.key}${locationQuery}`}
              className="trip-card"
            >
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
