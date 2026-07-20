"use client";
import dynamic from "next/dynamic";

// mapbox-gl touches window/WebGL at module load, so it must never run during
// SSR. ssr:false can only be used from a Client Component in the App Router —
// this thin wrapper exists so app/map/page.jsx can stay a Server Component.
const OutlierMap = dynamic(() => import("./OutlierMap"), {
  ssr: false,
  loading: () => <div className="outlier-map-wrap map-loading">Loading the map…</div>,
});

export default function OutlierMapLoader() {
  return <OutlierMap />;
}
