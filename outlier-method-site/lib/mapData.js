/* ============================================================
   MAP DATA — approximate real-world coordinates for the cam
   markers (lib/config.js CAMS) and state guide markers
   (lib/states.js). Keyed to match those data sources exactly.
============================================================ */

// Keyed by CAMS[].name. "Orvis Guide: Small Ponds & Rivers" isn't tied to a
// single real place (its `loc` is "Instructional Series"), so it's pinned at
// Orvis's Manchester, VT headquarters as the most defensible stand-in.
export const CAM_COORDS = {
  "Brooks Falls Bears": { latitude: 58.6199, longitude: -155.8000 },
  "Rocky Mountain Elk Trail Cam": { latitude: 41.3376, longitude: -78.1408 },
  "Whitetail Woods": { latitude: 39.9284, longitude: -79.7256 },
  "Orvis Guide: Small Ponds & Rivers": { latitude: 43.1687, longitude: -72.9973 },
  // Gardiner, MT — where the Yellowstone River exits the park, a well-known
  // whitewater stretch. Replaces the old Henry's Fork (Idaho) coordinates.
  "Yellowstone River Whitewater": { latitude: 45.0326, longitude: -110.7028 },
  "Wolf Country": { latitude: 47.9032, longitude: -91.8471 },
  "Grand Teton National Park": { latitude: 43.7904, longitude: -110.6818 },
};

// Keyed by lib/states.js slugs — approximate geographic centroid of each state.
export const STATE_COORDS = {
  colorado: { latitude: 39.5501, longitude: -105.7821 },
  wyoming: { latitude: 43.0759, longitude: -107.2903 },
  montana: { latitude: 46.8797, longitude: -110.3626 },
  idaho: { latitude: 44.0682, longitude: -114.7420 },
  utah: { latitude: 39.3210, longitude: -111.0937 },
};
