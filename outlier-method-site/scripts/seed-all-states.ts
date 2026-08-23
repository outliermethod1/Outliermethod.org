// Populates /admin/config for all 50 states from the research pass in
// state-config-data.ts — see that file and the README for caveats on what
// was and wasn't verified. Does not ingest any bylaw text. Safe to re-run.

import { seedAllStates } from "../lib/setup/bootstrap";
import { getPool } from "../lib/db/client";
import { STATE_CONFIG_DATA } from "./state-config-data";

async function main() {
  console.log(await seedAllStates());
  console.log(
    "Reminder: this populated contact info and watched URLs only. No bylaw text was ingested for " +
      "any state except Colorado's illustrative demo content — upload each state's real handbook via " +
      "/admin/documents before relying on Mode A answers for that state."
  );
  for (const s of STATE_CONFIG_DATA) {
    if (s.notes) console.log(`[${s.state_code.toUpperCase()}] ${s.notes}`);
  }
  await getPool().end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
