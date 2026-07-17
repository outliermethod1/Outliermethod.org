/* ============================================================
   OUTLIER METHOD — SITE CONFIG
   This is the one file you edit day to day.
   Cams, ticker items, campfire content, weather demo values.
============================================================ */

// LIVE CAMS — paste real embed URLs (Explore.org iframe src) into `embed`.
// Leave embed as "" to show the placeholder. Add cam #9+ as one more object.
export const CAMS = [
  { name: "Brooks Falls Bears", loc: "Katmai, Alaska", icon: "🐻", bg: "#4a3c28", embed: "https://www.youtube.com/embed/J7ZrIDvqlic?autoplay=1&mute=1" },
  { name: "Elk Country", loc: "Benezette, Pennsylvania", icon: "🦌", bg: "#3d4d35", embed: "https://www.youtube.com/embed/BG-qgAihcVY?autoplay=1&mute=1" },
  { name: "Whitetail Woods", loc: "Southwest Pennsylvania", icon: "🦌", bg: "#55401f", embed: "https://www.youtube.com/embed/XfNhPa26fP8?autoplay=1&mute=1" },
  { name: "Salmon Cam", loc: "Brooks River, Alaska", icon: "🐟", bg: "#2c3e4f", embed: "https://www.youtube.com/embed/QbP053g5TMY?autoplay=1&mute=1" },
  { name: "Henry's Fork Fly Water", loc: "Last Chance, Idaho", icon: "🎣", bg: "#35483d", embed: "https://v.angelcam.com/iframe?v=p2ygmn77yn&autoplay=1" },
  { name: "Wolf Country", loc: "Ely, Minnesota", icon: "🐺", bg: "#3d3d46", embed: "https://www.youtube.com/embed/5e4lsEe4Vew?autoplay=1&mute=1" },
];

// TICKER — later this array gets fed by the daily n8n workflow.
export const TICKER_ITEMS = [
  { icon: "🐻", text: "3 bears active", detail: "at Brooks Falls, Alaska" },
  { icon: "🦌", text: "Elk moving", detail: "at the Jackson Hole refuge" },
  { icon: "📖", text: "New article:", detail: "Best Wool Jackets Under $100" },
  { icon: "🛠", text: "Fresh restoration:", detail: "1940s Plumb hatchet in Outlier Originals" },
  { icon: "🔥", text: "Tonight around the campfire:", detail: "new song + Muir" },
];

// TONIGHT AROUND THE CAMPFIRE — swap daily (or automate via n8n later).
export const CAMPFIRE = {
  song: {
    title: "High Country Morning",
    sub: "Original field music, written for the places we cover. Hit play on the player, bottom left.",
  },
  quote: {
    text: "\u201CIn every walk with nature one receives far more than he seeks.\u201D",
    author: "— John Muir",
  },
  article: {
    title: "5 Vintage Fishing Reels That Still Outperform New Gear",
    sub: "Old steel, smooth drag, and why your grandfather's reel is still the smart buy.",
  },
  wildlife: {
    title: "Brooks Falls, Alaska",
    sub: "The bears are working the falls this evening. Best viewing is the next two hours before dusk.",
  },
};

// WEATHER — demo values. Phase 2: wire to Open-Meteo (free, no key).
export const WEATHER = {
  city: "Gypsum, CO",
  temp: "72°",
  air: "Good",
  pollen: "Moderate",
  icon: "☀️",
};

// AUDIO — your SoundCloud track title shown in the pill player.
export const AUDIO = {
  label: "Field Music · Original",
  track: "High Country Morning — Outlier Method",
  // Phase 1 wiring: set your SoundCloud track/playlist URL here,
  // then follow the notes in components/FieldAudio.jsx
  soundcloudUrl: "",
};

export const STATES = [
  { abbr: "CO", name: "Colorado", tags: "23M acres public land" },
  { abbr: "WY", name: "Wyoming", tags: "30M acres public land" },
  { abbr: "MT", name: "Montana", tags: "27M acres public land" },
  { abbr: "ID", name: "Idaho", tags: "32M acres public land" },
  { abbr: "UT", name: "Utah", tags: "33M acres public land" },
];
