import { query, queryOne } from "./client";

export async function recordAdminLoginAttempt(ip: string, success: boolean): Promise<void> {
  await query(`insert into admin_login_attempts (ip, success) values ($1, $2)`, [ip, success]);
}

export async function recentFailedAttempts(ip: string, sinceMinutes: number): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `select count(*)::text as count from admin_login_attempts
     where ip = $1 and success = false and created_at > now() - ($2 || ' minutes')::interval`,
    [ip, String(sinceMinutes)]
  );
  return Number(row?.count ?? 0);
}
