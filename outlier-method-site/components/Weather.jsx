"use client";

import { useEffect, useState } from "react";
import { WEATHER } from "../lib/config";

const WEATHER_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=39.647&longitude=-106.955&current=temperature_2m,weather_code&temperature_unit=fahrenheit";
const AIR_QUALITY_URL =
  "https://air-quality-api.open-meteo.com/v1/air-quality?latitude=39.647&longitude=-106.955&current=us_aqi";

function iconForWeatherCode(code) {
  if (code === 0) return "☀️";
  if (code === 1 || code === 2 || code === 3) return "☁️";
  if (code === 45 || code === 48) return "☁️";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return "🌧️";
  return "☁️";
}

function labelForAqi(aqi) {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  return "Poor";
}

export default function Weather() {
  const [temp, setTemp] = useState(WEATHER.temp);
  const [icon, setIcon] = useState(WEATHER.icon);
  const [air, setAir] = useState(WEATHER.air);
  const [aqi, setAqi] = useState(null);

  useEffect(() => {
    fetch(WEATHER_URL)
      .then((res) => res.json())
      .then((data) => {
        setTemp(`${Math.round(data.current.temperature_2m)}°`);
        setIcon(iconForWeatherCode(data.current.weather_code));
      })
      .catch(() => {});

    fetch(AIR_QUALITY_URL)
      .then((res) => res.json())
      .then((data) => {
        const usAqi = data.current.us_aqi;
        setAir(labelForAqi(usAqi));
        setAqi(usAqi);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="weather">
      <div className="w-icon">{icon}</div>
      <div className="w-temp">{temp}</div>
      <div className="w-meta">
        <div className="w-city">{WEATHER.city}</div>
        <div>
          Air Quality: <b>{air}</b>
        </div>
        <div>
          AQI: <b>{aqi ?? "—"}</b>
        </div>
      </div>
    </div>
  );
}
