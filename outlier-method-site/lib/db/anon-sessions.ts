import { query, queryOne } from "./client";

export interface AnonSession {
  id: string;
  exchange_count: number;
  ip_hash: string | null;
  created_at: string;
  updated_at: string;
}

export async function getOrCreateAnonSession(id: string, ipHash: string | null): Promise<AnonSession> {
  const row = await queryOne<AnonSession>(
    `insert into anon_sessions (id, ip_hash) values ($1, $2)
     on conflict (id) do update set updated_at = anon_sessions.updated_at
     returning *`,
    [id, ipHash]
  );
  if (!row) throw new Error("Failed to create anon session");
  return row;
}

export async function getIpUsageCount(ipHash: string): Promise<number> {
  const row = await queryOne<{ exchange_count: number }>(
    `select exchange_count from anon_ip_usage where ip_hash = $1`,
    [ipHash]
  );
  return row?.exchange_count ?? 0;
}

/** Increments both the per-session and per-IP counters together, atomically per call. */
export async function incrementAnonExchange(id: string, ipHash: string | null): Promise<number> {
  const row = await queryOne<{ exchange_count: number }>(
    `update anon_sessions set exchange_count = exchange_count + 1, updated_at = now()
     where id = $1
     returning exchange_count`,
    [id]
  );
  if (ipHash) {
    await query(
      `insert into anon_ip_usage (ip_hash, exchange_count) values ($1, 1)
       on conflict (ip_hash) do update set exchange_count = anon_ip_usage.exchange_count + 1, updated_at = now()`,
      [ipHash]
    );
  }
  return row?.exchange_count ?? 0;
}
