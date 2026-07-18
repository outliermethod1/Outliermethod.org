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
