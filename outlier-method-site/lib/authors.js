export const AUTHORS = {
  ryan: {
    name: "Ryan Lynch",
    role: "Founder",
    avatar: "/ryan.png",
    bio: "Founder of Outlier Method. Field-tests everything he recommends — usually at altitude, usually in weather he should have checked first.",
  },
  amos: {
    name: "Amos Flint",
    role: "Resident Guide",
    avatar: "/amos.png",
    bio: "Old trapper. Public land expert. Believes most problems can be solved with wool, patience, and a sixty-year-old knife.",
  },
  eleanor: {
    name: "Eleanor Crowe",
    role: "Resident Guide",
    avatar: "/eleanor.png",
    bio: "Outdoorswoman and naturalist. Gets families and first-timers outside without the intimidation or the four-figure gear bill.",
  },
  jesse: {
    name: "Jesse Meryhew",
    role: "Staff Writer",
    avatar: "/jesse.png",
    bio: "Western Slope born and raised, out of Grand Junction. Facilities manager by trade, hunter by every season he can get. Jesse's spent years tracking big game in Colorado's high country — he writes about what the mountain actually teaches, not what the catalogs sell.",
  },
};

export const DEFAULT_AUTHOR = "ryan";

export function resolveAuthor(id) {
  const key = AUTHORS[id] ? id : DEFAULT_AUTHOR;
  return { id: key, ...AUTHORS[key] };
}

export function initials(name) {
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}
