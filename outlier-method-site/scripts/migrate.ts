import { runMigration } from "../lib/setup/bootstrap";
import { getPool } from "../lib/db/client";

async function main() {
  console.log(await runMigration());
  await getPool().end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
