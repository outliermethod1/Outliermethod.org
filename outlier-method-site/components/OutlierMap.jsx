"use client";
import { useCallback, useMemo, useRef, useState } from "react";
import Map, { Marker, Popup, NavigationControl, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { CAMS } from "../lib/config";
import { STATES } from "../lib/states";
import { CAM_COORDS, STATE_COORDS } from "../lib/mapData";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

const STYLES = {
  dark: { label: "Street", url: "mapbox://styles/mapbox/dark-v11" },
  satellite: { label: "Satellite", url: "mapbox://styles/mapbox/satellite-v9" },
  outdoors: { label: "Topo", url: "mapbox://styles/mapbox/outdoors-v12" },
};

const DEFAULT_VIEW = { longitude: -105.7821, latitude: 39.5501, zoom: 6 };

const BLM_LAYER_MIN_ZOOM = 7;

// TODO(ryan): verify this BLM ArcGIS REST endpoint before relying on it in
// production. BLM's Surface Management Agency (SMA) polygons are served from
// their public GIS REST services, and the URL below is the commonly
// documented national layer for it — but BLM reorganizes these services from
// time to time, and this sandbox has no outbound network access to test the
// request. If it 404s or the schema has changed, the catch block below just
// leaves the Public Land layer empty; the rest of the map keeps working.
const BLM_SMA_QUERY_URL =
  "https://gis.blm.gov/arcgis/rest/services/lands/BLM_Natl_SMA_LimitedScope/MapServer/1/query";

function formatCoords(lat, lng) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${latDir}, ${Math.abs(lng).toFixed(3)}°${lngDir}`;
}

// Open-Meteo's geocoding API is forward-only (name -> coords); it has no
// reverse endpoint. We already need a Mapbox token for the map itself, so
// reverse lookups use Mapbox's geocoder instead, with the same "fall back to
// raw coordinates" behavior on failure.
async function reverseGeocode(lat, lng) {
  if (!MAPBOX_TOKEN) return null;
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place,region`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.features?.[0]?.place_name || null;
  } catch {
    return null;
  }
}

export default function OutlierMap() {
  const [styleKey, setStyleKey] = useState("dark");
  const [popup, setPopup] = useState(null);
  const [showPublicLand, setShowPublicLand] = useState(false);
  const [publicLand, setPublicLand] = useState(null);
  const [publicLandStatus, setPublicLandStatus] = useState("idle");
  const mapRef = useRef(null);

  const camMarkers = useMemo(
    () =>
      CAMS.map((cam) => {
        const coords = CAM_COORDS[cam.name];
        return coords ? { ...cam, ...coords } : null;
      }).filter(Boolean),
    []
  );

  const stateMarkers = useMemo(
    () =>
      Object.entries(STATES)
        .filter(([slug]) => STATE_COORDS[slug])
        .map(([slug, state]) => ({ slug, ...state, ...STATE_COORDS[slug] })),
    []
  );

  async function loadPublicLand(bounds) {
    setPublicLandStatus("loading");
    try {
      const bbox = `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`;
      const url =
        `${BLM_SMA_QUERY_URL}?geometry=${encodeURIComponent(bbox)}&geometryType=esriGeometryEnvelope` +
        `&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=true&f=geojson`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("blm_request_failed");
      const geojson = await res.json();
      if (!geojson || geojson.type !== "FeatureCollection") throw new Error("blm_bad_response");
      setPublicLand(geojson);
      setPublicLandStatus("ready");
    } catch {
      // Graceful fallback — the map works fine without this layer.
      setPublicLand(null);
      setPublicLandStatus("error");
    }
  }

  const handleMoveEnd = useCallback(() => {
    if (!showPublicLand) return;
    const map = mapRef.current?.getMap();
    if (!map || map.getZoom() < BLM_LAYER_MIN_ZOOM) return;
    loadPublicLand(map.getBounds());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showPublicLand]);

  function togglePublicLand() {
    setShowPublicLand((prev) => {
      const next = !prev;
      if (next) {
        const map = mapRef.current?.getMap();
        if (map && map.getZoom() >= BLM_LAYER_MIN_ZOOM) loadPublicLand(map.getBounds());
      }
      return next;
    });
  }

  async function handleMapClick(e) {
    const { lng, lat } = e.lngLat;
    setPopup({ kind: "trip", longitude: lng, latitude: lat, label: formatCoords(lat, lng) });
    const name = await reverseGeocode(lat, lng);
    if (name) {
      setPopup((prev) =>
        prev && prev.kind === "trip" && prev.longitude === lng && prev.latitude === lat
          ? { ...prev, label: name }
          : prev
      );
    }
  }

  if (!MAPBOX_TOKEN) {
    return (
      <div className="outlier-map-wrap map-loading map-missing-token">
        <p>
          The interactive map needs a Mapbox token. Set{" "}
          <code>NEXT_PUBLIC_MAPBOX_TOKEN</code> in your environment to enable it.
        </p>
      </div>
    );
  }

  return (
    <div className="outlier-map-wrap">
      <div className="map-controls">
        <div className="map-style-toggle">
          {Object.entries(STYLES).map(([key, s]) => (
            <button
              key={key}
              type="button"
              className={`map-style-btn ${styleKey === key ? "active" : ""}`}
              onClick={() => setStyleKey(key)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={`map-style-btn map-land-toggle ${showPublicLand ? "active" : ""}`}
          onClick={togglePublicLand}
        >
          Public Land (BLM) · Beta{publicLandStatus === "loading" && showPublicLand ? "…" : ""}
        </button>
      </div>

      <Map
        ref={mapRef}
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={DEFAULT_VIEW}
        mapStyle={STYLES[styleKey].url}
        style={{ width: "100%", height: "100%" }}
        onClick={handleMapClick}
        onMoveEnd={handleMoveEnd}
      >
        <NavigationControl position="top-right" />

        {showPublicLand && publicLand && (
          <Source id="blm-public-land" type="geojson" data={publicLand}>
            <Layer
              id="blm-public-land-fill"
              type="fill"
              paint={{ "fill-color": "#7fa05e", "fill-opacity": 0.25 }}
            />
            <Layer
              id="blm-public-land-line"
              type="line"
              paint={{ "line-color": "#b08d57", "line-width": 1 }}
            />
          </Source>
        )}

        {camMarkers.map((cam) => (
          <Marker
            key={cam.name}
            longitude={cam.longitude}
            latitude={cam.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopup({ kind: "cam", longitude: cam.longitude, latitude: cam.latitude, cam });
            }}
          >
            <div className="map-pin map-pin-cam" title={cam.name}>
              {cam.icon}
            </div>
          </Marker>
        ))}

        {stateMarkers.map((state) => (
          <Marker
            key={state.slug}
            longitude={state.longitude}
            latitude={state.latitude}
            anchor="bottom"
            onClick={(e) => {
              e.originalEvent.stopPropagation();
              setPopup({ kind: "state", longitude: state.longitude, latitude: state.latitude, state });
            }}
          >
            <div className="map-pin map-pin-state" title={state.name}>
              {state.abbr}
            </div>
          </Marker>
        ))}

        {popup && popup.kind === "cam" && (
          <Popup
            longitude={popup.longitude}
            latitude={popup.latitude}
            anchor="top"
            closeOnClick={false}
            onClose={() => setPopup(null)}
            className="map-popup"
          >
            <div className="map-popup-title">{popup.cam.name}</div>
            <div className="map-popup-sub">{popup.cam.loc}</div>
            <a href="/#live" className="map-popup-link">
              Watch Live →
            </a>
          </Popup>
        )}

        {popup && popup.kind === "state" && (
          <Popup
            longitude={popup.longitude}
            latitude={popup.latitude}
            anchor="top"
            closeOnClick={false}
            onClose={() => setPopup(null)}
            className="map-popup"
          >
            <div className="map-popup-title">{popup.state.name}</div>
            <div className="map-popup-sub">{popup.state.publicLandActs}</div>
            <a href={`/states/${popup.state.slug}`} className="map-popup-link">
              State Guide →
            </a>
          </Popup>
        )}

        {popup && popup.kind === "trip" && (
          <Popup
            longitude={popup.longitude}
            latitude={popup.latitude}
            anchor="top"
            closeOnClick={false}
            onClose={() => setPopup(null)}
            className="map-popup"
          >
            <div className="map-popup-title">{popup.label}</div>
            <div className="map-popup-sub">
              {popup.latitude.toFixed(4)}, {popup.longitude.toFixed(4)}
            </div>
            <a
              href={`/trip-planner?lat=${popup.latitude.toFixed(5)}&lng=${popup.longitude.toFixed(5)}`}
              className="map-popup-link"
            >
              Plan Your Trip Here →
            </a>
          </Popup>
        )}
      </Map>

      {showPublicLand && publicLandStatus === "error" && (
        <p className="map-land-note">
          Public land boundaries didn&apos;t load for this view — the BLM data source may
          be unavailable right now. Everything else on the map still works.
        </p>
      )}
    </div>
  );
}
