import { Pool, types } from "pg";

// Return `date` columns as plain "YYYY-MM-DD" strings instead of node-postgres's
// default JS Date (which serializes to a full ISO timestamp and reads wrong
// everywhere a bare effective date is displayed).
types.setTypeParser(1082, (val: string) => val);

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not set. Connect a Postgres database (Neon via the Vercel integration) and set it in your environment."
    );
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("sslmode") ? undefined : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const { rows } = await getPool().query(text, params);
  return rows;
}

export async function queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}
