// Populates /admin/config for all 50 states from the research pass in
// state-config-data.ts: association name, eligibility contact, and watched
// URLs (handbook + bulletins) for the crawler to check daily.
//
// This does NOT ingest any bylaw text — no state gets bylaw_chunks from this
// script except Colorado, which already has the illustrative seed content
// from scripts/seed.ts. Every other state will show up in /coach with no
// bylaws until its handbook PDF is uploaded via /admin/documents (or the
// crawler finds one to route through the review queue).
//
// Safe to re-run: upsertState updates in place, and this script skips a
// watched URL if one with the same state+url already exists.

import { upsertState } from "../lib/db/states";
import { addWatchedUrl, listWatchedUrls } from "../lib/db/watched-urls";
import { getPool } from "../lib/db/client";
import { STATE_CONFIG_DATA } from "./state-config-data";

async function main() {
  const existing = await listWatchedUrls();
  const existingKey = new Set(existing.map((u) => `${u.state_code}:${u.url}`));

  for (const s of STATE_CONFIG_DATA) {
    await upsertState({
      state_code: s.state_code,
      state_name: s.state_name,
      association_name: s.association_name,
      eligibility_contact_name: s.eligibility_contact_name,
      eligibility_contact_phone: s.eligibility_contact_phone,
      eligibility_contact_email: s.eligibility_contact_email,
    });

    const urls: { url: string; label: string }[] = [
      { url: s.handbook_url, label: `${s.association_name.split(" (")[0]} Handbook / Bylaws` },
    ];
    if (s.bulletins_url) {
      urls.push({ url: s.bulletins_url, label: `${s.association_name.split(" (")[0]} Bulletins / Amendments` });
    }

    for (const u of urls) {
      const key = `${s.state_code}:${u.url}`;
      if (existingKey.has(key)) continue;
      await addWatchedUrl(s.state_code, u.url, u.label);
      existingKey.add(key);
    }

    if (s.notes) {
      console.log(`[${s.state_code.toUpperCase()}] ${s.notes}`);
    }
  }

  console.log(`\nSeeded config for ${STATE_CONFIG_DATA.length} states.`);
  console.log(
    "Reminder: this populated contact info and watched URLs only. No bylaw text was ingested for " +
      "any state except Colorado's illustrative demo content — upload each state's real handbook via " +
      "/admin/documents before relying on Mode A answers for that state."
  );

  await getPool().end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
