import { notFound } from "next/navigation";
import Ticker from "../../../components/Ticker";
import Header from "../../../components/Header";
import FieldAudio from "../../../components/FieldAudio";
import { Footer } from "../../../components/Sections";
import TripPlannerActivity from "../../../components/TripPlannerActivity";
import { ACTIVITIES, getActivity, getActivityKeys } from "../../../lib/tripPlanner";

export function generateStaticParams() {
  return getActivityKeys().map((activity) => ({ activity }));
}

export function generateMetadata({ params }) {
  const activity = getActivity(params.activity);
  if (!activity) return {};

  return {
    title: `${activity.label} Trip Planner — Outlier Method`,
    description: `Check real conditions for your next ${activity.label.toLowerCase()} trip — forecast, wind, sunrise and sunset, and a field read before you go.`,
  };
}

export default function TripPlannerActivityPage({ params, searchParams }) {
  const activity = ACTIVITIES[params.activity];
  if (!activity) notFound();

  const lat = searchParams?.lat ? parseFloat(searchParams.lat) : null;
  const lng = searchParams?.lng ? parseFloat(searchParams.lng) : null;

  return (
    <>
      <Ticker />
      <Header />
      <div className="wrap">
        <a href="/trip-planner" className="post-back">
          ← All Trip Types
        </a>
        <TripPlannerActivity
          activityKey={params.activity}
          initialLat={Number.isFinite(lat) ? lat : null}
          initialLng={Number.isFinite(lng) ? lng : null}
        />
      </div>
      <Footer />
      <FieldAudio />
    </>
  );
}
