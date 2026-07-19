/* ============================================================
   STATE GUIDES — data for /states and /states/[slug].
   Agency URLs point to official state agency domains only.
   Where a deep link couldn't be verified, we link a verified
   section page (or the homepage) instead of guessing.
============================================================ */

export const STATES = {
  colorado: {
    name: "Colorado",
    abbr: "CO",
    publicLandActs: "23M+ acres of public land — USFS, BLM, and state trust",
    agencies: [
      { label: "Colorado Parks & Wildlife", url: "https://cpw.state.co.us" },
      { label: "Hunting Regulations & Brochures", url: "https://cpw.state.co.us/hunting" },
      { label: "Buy a License (CPW Shop)", url: "https://www.cpwshop.com" },
      { label: "Big Game Draw & Applications", url: "https://cpw.state.co.us/hunting/big-game" },
    ],
    outlierTake: [
      "Colorado runs most of its big game licenses through an annual draw. You apply in the spring for the licenses you want in the fall, and the draw uses a preference point system — miss out on a license, earn a point, and points improve your odds in future years. Some licenses have historically been available over the counter without a draw at all, while the most sought-after hunts can take years of points to pull. Which is which changes over time, so treat the draw-versus-OTC question as something you confirm with CPW every single year, never something you assume.",
      "The state is carved into game management units, and your license is generally tied to specific units. Two units that touch each other on the map can hunt completely differently — different pressure, different access, different animal densities. Unit research is where a Colorado hunt is actually won or lost: study the terrain, the access points, and the harvest data CPW publishes before you commit your points or your season to a unit. A mediocre plan in a well-researched unit beats a great plan in a unit you picked off a rumor.",
      "The public land situation is the good news. Colorado has one of the best public land mixes in the West — enormous stretches of National Forest up high, BLM ground in the lower country, and state trust land scattered through it. Learn the difference, because access rules aren't identical across them, and a good mapping app that shows land ownership boundaries is worth more than most gear you could buy instead.",
      "One thing flatlanders underestimate every year: the altitude. A lot of Colorado's best hunting lives above 9,000 feet, and no amount of sea-level fitness fully spares you from thin air. Build in time to acclimate, hydrate like it's your job, know the early signs of altitude sickness, and plan your first days conservatively. And before any of this becomes a plan: verify every season, deadline, and regulation directly with Colorado Parks & Wildlife — rules change, and the agency is the only source that counts.",
    ],
    camName: "Elk Country",
  },
  wyoming: {
    name: "Wyoming",
    abbr: "WY",
    publicLandActs: "30M+ acres of public land — BLM, USFS, and state sections",
    agencies: [
      { label: "Wyoming Game & Fish Department", url: "https://wgfd.wyo.gov" },
      { label: "Hunting Regulations & Info", url: "https://wgfd.wyo.gov/hunting" },
      { label: "Buy a License", url: "https://wgfd.wyo.gov/apply-or-buy" },
      { label: "Draw Applications & Preference Points", url: "https://wgfd.wyo.gov/apply-or-buy" },
    ],
    outlierTake: null,
    camName: null,
  },
  montana: {
    name: "Montana",
    abbr: "MT",
    publicLandActs: "27M+ acres of public land — USFS, BLM, and state lands",
    agencies: [
      { label: "Montana Fish, Wildlife & Parks", url: "https://fwp.mt.gov" },
      { label: "Hunting Regulations & Seasons", url: "https://fwp.mt.gov/hunt" },
      { label: "Buy a License", url: "https://fwp.mt.gov/buyandapply" },
      { label: "Permit Draws & Applications", url: "https://fwp.mt.gov/buyandapply" },
    ],
    outlierTake: null,
    camName: null,
  },
  idaho: {
    name: "Idaho",
    abbr: "ID",
    publicLandActs: "32M+ acres of public land — the most by share in the lower 48",
    agencies: [
      { label: "Idaho Fish & Game", url: "https://idfg.idaho.gov" },
      { label: "Hunting Seasons & Rules", url: "https://idfg.idaho.gov/hunt" },
      { label: "Licenses, Tags & Permits", url: "https://idfg.idaho.gov/licenses" },
      { label: "Controlled Hunt Drawings", url: "https://idfg.idaho.gov/hunt" },
    ],
    outlierTake: null,
    camName: null,
  },
  utah: {
    name: "Utah",
    abbr: "UT",
    publicLandActs: "33M+ acres of public land — BLM, USFS, and state trust",
    agencies: [
      { label: "Utah Division of Wildlife Resources", url: "https://wildlife.utah.gov" },
      { label: "Hunting Rules & Guidebooks", url: "https://wildlife.utah.gov/hunting/" },
      { label: "Licenses & Permits", url: "https://wildlife.utah.gov" },
      { label: "Permit Drawings", url: "https://wildlife.utah.gov/hunting/" },
    ],
    outlierTake: null,
    camName: null,
  },
};

export function getStateSlugs() {
  return Object.keys(STATES);
}

export function getState(slug) {
  return STATES[slug] || null;
}
