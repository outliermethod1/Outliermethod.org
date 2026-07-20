"use client";
import { useEffect, useState } from "react";
import AuthorAvatar from "./AuthorAvatar";
import AskBar from "./AskBar";
import { resolveAuthor } from "../lib/authors";
import { getActivity } from "../lib/tripPlanner";

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function formatCoordsLabel(lat, lng) {
  const latDir = lat >= 0 ? "N" : "S";
  const lngDir = lng >= 0 ? "E" : "W";
  return `${Math.abs(lat).toFixed(3)}°${latDir}, ${Math.abs(lng).toFixed(3)}°${lngDir}`;
}

// Open-Meteo's geocoder matches on the place-name field only — it does not
// parse "City, State" compound strings, so a query like "Gunnison, CO" (the
// exact format our own placeholder asks for) returns zero results. Searching
// on just the part before the first comma is what actually finds the place;
// the admin1 field in the response still gives us the state for display.
function extractSearchTerm(raw) {
  return raw.split(",")[0].trim();
}

// Open-Meteo's geocoding API only does forward lookups (name -> coords), so a
// pin dropped on the map (coords -> name) goes through Mapbox's geocoder
// instead, since we already carry that token for the map itself. Falls back
// to raw coordinates exactly like a failed Open-Meteo lookup would.
async function reverseGeocodeCoords(lat, lng) {
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

const PERSONA_LABEL = { amos: "Amos", eleanor: "Eleanor" };

const WIND_COMPASS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

function degToCompass(deg) {
  return WIND_COMPASS[Math.round(deg / 22.5) % 16];
}

function formatTime(isoLocal) {
  if (!isoLocal) return "—";
  const time = isoLocal.split("T")[1];
  if (!time) return "—";
  let [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

function formatDayLabel(dateStr) {
  const d = new Date(`${dateStr}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
}

function summarizeForecast(data) {
  const { hourly, daily } = data;
  const byDate = {};
  hourly.time.forEach((ts, i) => {
    const date = ts.slice(0, 10);
    if (!byDate[date]) byDate[date] = { temps: [], winds: [], windDirs: [], precs: [] };
    byDate[date].temps.push(hourly.temperature_2m[i]);
    byDate[date].winds.push(hourly.wind_speed_10m[i]);
    byDate[date].windDirs.push(hourly.wind_direction_10m[i]);
    byDate[date].precs.push(hourly.precipitation_probability[i]);
  });

  return daily.time.map((date, i) => {
    const d = byDate[date];
    const tempMax = d ? Math.round(Math.max(...d.temps)) : null;
    const tempMin = d ? Math.round(Math.min(...d.temps)) : null;
    const windSpeed = d ? Math.round(d.winds.reduce((a, b) => a + b, 0) / d.winds.length) : null;
    const windDir = d ? degToCompass(d.windDirs.reduce((a, b) => a + b, 0) / d.windDirs.length) : "";
    const precipChance = d ? Math.round(Math.max(...d.precs)) : null;
    return {
      date,
      tempMax,
      tempMin,
      windSpeed,
      windDir,
      precipChance,
      sunrise: daily.sunrise[i],
      sunset: daily.sunset[i],
    };
  });
}

const DATE_RANGES = {
  today: { label: "Today", forecastDays: 1 },
  next3: { label: "Next 3 Days", forecastDays: 3 },
  weekend: { label: "This Weekend", forecastDays: 7 },
  week: { label: "Next 7 Days", forecastDays: 7 },
};
const DEFAULT_RANGE = "next3";

// "This Weekend" fetches a full week (Open-Meteo has no "give me the next
// Sat/Sun" option) and we filter down to just the Saturday/Sunday in it.
function filterDaysForRange(days, rangeKey) {
  if (rangeKey !== "weekend") return days;
  return days.filter((d) => {
    const day = new Date(`${d.date}T12:00:00`).getDay();
    return day === 0 || day === 6;
  });
}

function buildForecastSummaryText(locationLabel, days) {
  const lines = days.map(
    (d) =>
      `${formatDayLabel(d.date)}: High ${d.tempMax}°F / Low ${d.tempMin}°F, wind ${d.windSpeed} mph ${d.windDir}, ${d.precipChance}% chance of precipitation, sunrise ${formatTime(d.sunrise)}, sunset ${formatTime(d.sunset)}.`
  );
  return `Location: ${locationLabel}\n${lines.join("\n")}`;
}

export default function TripPlannerActivity({ activityKey, initialLat = null, initialLng = null }) {
  const activity = getActivity(activityKey);

  const [location, setLocation] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | ready
  const [errorMsg, setErrorMsg] = useState("");
  const [resolvedLabel, setResolvedLabel] = useState("");
  const [resolvedCoords, setResolvedCoords] = useState(null);
  const [dateRange, setDateRange] = useState(DEFAULT_RANGE);
  const [days, setDays] = useState([]);
  const [readAnswer, setReadAnswer] = useState("");
  const [readLoading, setReadLoading] = useState(false);

  const personaAuthor = resolveAuthor(activity.persona);
  const personaLabel = PERSONA_LABEL[activity.persona] || personaAuthor.name;

  async function fetchRead(label, summarizedDays) {
    setReadLoading(true);
    try {
      const res = await fetch("/api/trip-weather-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activity: activity.key,
          location: label,
          forecastSummary: buildForecastSummaryText(label, summarizedDays),
        }),
      });
      const data = await res.json();
      setReadAnswer(data.answer || "");
    } catch {
      setReadAnswer("");
    } finally {
      setReadLoading(false);
    }
  }

  async function loadConditionsForCoords(lat, lng, label, rangeKey = dateRange) {
    setStatus("loading");
    setErrorMsg("");
    setReadAnswer("");

    const forecastDays = DATE_RANGES[rangeKey]?.forecastDays || DATE_RANGES[DEFAULT_RANGE].forecastDays;

    try {
      const forecastRes = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&hourly=temperature_2m,wind_speed_10m,wind_direction_10m,precipitation_probability&daily=sunrise,sunset&forecast_days=${forecastDays}&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`
      );
      const forecastData = await forecastRes.json();

      if (!forecastData.hourly || !forecastData.daily) {
        setStatus("error");
        setErrorMsg("Couldn't load conditions for that spot. Try again in a minute.");
        return;
      }

      const summarized = filterDaysForRange(summarizeForecast(forecastData), rangeKey);
      setResolvedLabel(label);
      setResolvedCoords({ lat, lng });
      setDays(summarized);
      setStatus("ready");

      fetchRead(label, summarized);
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't load conditions right now. Try again in a minute.");
    }
  }

  function handleRangeChange(key) {
    setDateRange(key);
    if (resolvedCoords) {
      loadConditionsForCoords(resolvedCoords.lat, resolvedCoords.lng, resolvedLabel, key);
    }
  }

  async function checkConditions(e) {
    e.preventDefault();
    const query = location.trim();
    if (!query || status === "loading") return;

    setStatus("loading");
    setErrorMsg("");
    setReadAnswer("");

    try {
      const geoRes = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(extractSearchTerm(query))}&count=1&language=en&format=json`
      );
      const geoData = await geoRes.json();
      const place = geoData.results?.[0];

      if (!place) {
        setStatus("error");
        setErrorMsg('Couldn’t find that location — try a city and state, like "Gunnison, CO."');
        return;
      }

      const label = [place.name, place.admin1].filter(Boolean).join(", ");
      await loadConditionsForCoords(place.latitude, place.longitude, label);
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't load conditions right now. Try again in a minute.");
    }
  }

  // Arrived from a map pin (?lat=&lng=) — pre-fill the location and check
  // conditions right away instead of making the visitor retype what they
  // already picked on the map.
  useEffect(() => {
    if (initialLat == null || initialLng == null) return;

    let cancelled = false;
    (async () => {
      const name = await reverseGeocodeCoords(initialLat, initialLng);
      if (cancelled) return;
      const label = name || formatCoordsLabel(initialLat, initialLng);
      setLocation(label);
      loadConditionsForCoords(initialLat, initialLng, label);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialLat, initialLng]);

  const chatContext =
    status === "ready"
      ? `Trip context: the visitor is planning a ${activity.label.toLowerCase()} trip near ${resolvedLabel}. Here's the forecast already shown to them on this page (${DATE_RANGES[dateRange].label.toLowerCase()}):\n${buildForecastSummaryText(resolvedLabel, days)}\n\nUse this naturally if they ask follow-up questions like packing or timing — no need to re-explain the forecast itself.`
      : "";

  return (
    <>
      <div className="blog-head">
        <div className="trip-persona-tag">
          <AuthorAvatar author={personaAuthor} className="avatar-28" />
          <span>{personaAuthor.name} · {activity.label} Guide</span>
        </div>
        <h1 className="display">{activity.label} Trip Planner</h1>
        <p>{activity.blurb}</p>
      </div>

      <form className="trip-form" onSubmit={checkConditions}>
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City and state, e.g. Gunnison, CO"
        />
        <button type="submit" disabled={status === "loading"}>
          {status === "loading" ? "Checking…" : "Check Conditions"}
        </button>
      </form>

      <div className="trip-range-toggle">
        {Object.entries(DATE_RANGES).map(([key, r]) => (
          <button
            key={key}
            type="button"
            className={`trip-range-btn ${dateRange === key ? "active" : ""}`}
            onClick={() => handleRangeChange(key)}
            disabled={status === "loading"}
          >
            {r.label}
          </button>
        ))}
      </div>

      {status === "error" && <p className="trip-error">{errorMsg}</p>}

      {status === "ready" && (
        <>
          <div className="trip-location">{resolvedLabel}</div>
          <div className="trip-forecast">
            {days.map((d) => (
              <div className="trip-day" key={d.date}>
                <div className="trip-day-label">{formatDayLabel(d.date)}</div>
                <div className="trip-day-temp">{d.tempMax}° / {d.tempMin}°</div>
                <div className="trip-day-row">
                  <span>Wind</span>
                  <span>{d.windSpeed} mph {d.windDir}</span>
                </div>
                <div className="trip-day-row">
                  <span>Precip</span>
                  <span>{d.precipChance}%</span>
                </div>
                <div className="trip-day-row">
                  <span>Sunrise</span>
                  <span>{formatTime(d.sunrise)}</span>
                </div>
                <div className="trip-day-row">
                  <span>Sunset</span>
                  <span>{formatTime(d.sunset)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="trip-read">
            <div className="trip-read-head">
              <AuthorAvatar author={personaAuthor} className="avatar-sm" />
              <div>
                <div className="trip-read-name">{personaLabel}&apos;s Read</div>
                <div className="trip-read-role">{personaAuthor.role}</div>
              </div>
            </div>
            <div className="trip-read-body">
              {readLoading ? (
                <p className="ft-verdict">{personaLabel} is reading the conditions…</p>
              ) : (
                <p>{readAnswer || "No read available right now — check back in a minute."}</p>
              )}
            </div>
          </div>

          <p className="trip-disclaimer">
            General field advice — not a substitute for official forecasts or agency guidance.
          </p>

          <AskBar initialPersona={activity.persona} context={chatContext} hints={activity.chatHints} />
        </>
      )}
    </>
  );
}
