// Seeds Colorado (CHSAA) with illustrative placeholder bylaw text — see
// lib/setup/bootstrap.ts for the actual content and the caveat about it not
// being real CHSAA text. Idempotent: skips if Colorado already has chunks.

import { seedColoradoDemo } from "../lib/setup/bootstrap";
import { getPool } from "../lib/db/client";

async function main() {
  console.log(await seedColoradoDemo());
  await getPool().end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
