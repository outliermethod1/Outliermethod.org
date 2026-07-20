export const ACTIVITIES = {
  hunting: {
    key: "hunting",
    label: "Hunting",
    icon: "🎯",
    persona: "amos",
    blurb: "Wind, temperature swings, and glassing light — the calls that matter before you head out.",
    chatHints: ["What should I pack for this?", "Best time to glass tomorrow?"],
  },
  fishing: {
    key: "fishing",
    label: "Fishing",
    icon: "🎣",
    persona: "amos",
    blurb: "Pressure trends, water temp, and the light windows that actually move fish.",
    chatHints: ["What should I pack for this?", "Best time to fish tomorrow?"],
  },
  camping: {
    key: "camping",
    label: "Camping",
    icon: "🏕️",
    persona: "eleanor",
    blurb: "Overnight lows, precip timing, and wind — plan the camp before you pitch it.",
    chatHints: ["What should I pack for this?", "Good night for a campfire?"],
  },
  hiking: {
    key: "hiking",
    label: "Hiking",
    icon: "🥾",
    persona: "eleanor",
    blurb: "Storm risk, sun exposure, and trail conditions — know before you climb.",
    chatHints: ["What should I pack for this?", "What time should I turn around?"],
  },
};

export function getActivity(key) {
  return ACTIVITIES[key] || null;
}

export function getActivityKeys() {
  return Object.keys(ACTIVITIES);
}
