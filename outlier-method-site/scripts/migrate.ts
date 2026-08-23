import fs from "fs";
import path from "path";
import { getPool } from "../lib/db/client";

async function main() {
  const sql = fs.readFileSync(path.join(__dirname, "../migrations/001_init.sql"), "utf-8");
  const pool = getPool();
  await pool.query(sql);
  console.log("Migration applied.");
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
