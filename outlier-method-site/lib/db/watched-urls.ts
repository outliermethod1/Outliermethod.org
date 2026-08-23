import { query, queryOne } from "./client";
import type { WatchedUrl } from "./types";

export async function listWatchedUrls(stateCode?: string): Promise<WatchedUrl[]> {
  if (stateCode) {
    return query<WatchedUrl>(`select * from watched_urls where state_code = $1 order by label`, [
      stateCode.toLowerCase(),
    ]);
  }
  return query<WatchedUrl>(`select * from watched_urls order by state_code, label`);
}

export async function addWatchedUrl(stateCode: string, url: string, label: string): Promise<WatchedUrl> {
  const row = await queryOne<WatchedUrl>(
    `insert into watched_urls (state_code, url, label) values ($1, $2, $3) returning *`,
    [stateCode.toLowerCase(), url, label]
  );
  if (!row) throw new Error("Failed to add watched URL");
  return row;
}

export async function recordCheckResult(
  id: string,
  result: { status: "ok" | "unchanged" | "error_404" | "error_other"; contentHash?: string; changed: boolean }
): Promise<void> {
  if (result.changed) {
    await query(
      `update watched_urls set
         last_checked_at = now(),
         last_changed_at = now(),
         last_status = $2,
         content_hash = $3,
         consecutive_failures = 0,
         consecutive_unchanged_checks = 0
       where id = $1`,
      [id, result.status, result.contentHash ?? null]
    );
  } else if (result.status === "error_404" || result.status === "error_other") {
    await query(
      `update watched_urls set
         last_checked_at = now(),
         last_status = $2,
         consecutive_failures = consecutive_failures + 1
       where id = $1`,
      [id, result.status]
    );
  } else {
    await query(
      `update watched_urls set
         last_checked_at = now(),
         last_status = $2,
         consecutive_unchanged_checks = consecutive_unchanged_checks + 1
       where id = $1`,
      [id, result.status]
    );
  }
}
