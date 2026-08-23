import { query, queryOne } from "./client";
import type { ReviewQueueItem } from "./types";

export async function listReviewQueue(status: "pending" | "approved" | "rejected" = "pending") {
  return query<ReviewQueueItem>(
    `select * from review_queue where status = $1 order by detected_at desc`,
    [status]
  );
}

export async function addReviewItem(item: {
  state_code: string;
  watched_url_id: string | null;
  blob_path: string;
  content_hash: string;
  diff_summary: string | null;
}): Promise<ReviewQueueItem> {
  const row = await queryOne<ReviewQueueItem>(
    `insert into review_queue (state_code, watched_url_id, blob_path, content_hash, diff_summary)
     values ($1,$2,$3,$4,$5) returning *`,
    [item.state_code.toLowerCase(), item.watched_url_id, item.blob_path, item.content_hash, item.diff_summary]
  );
  if (!row) throw new Error("Failed to add review item");
  return row;
}

export async function setReviewStatus(
  id: string,
  status: "approved" | "rejected",
  effectiveDate?: string
): Promise<void> {
  await query(
    `update review_queue set status = $2, reviewed_at = now(), effective_date = coalesce($3, effective_date)
     where id = $1`,
    [id, status, effectiveDate ?? null]
  );
}

export async function getReviewItem(id: string): Promise<ReviewQueueItem | null> {
  return queryOne<ReviewQueueItem>(`select * from review_queue where id = $1`, [id]);
}
