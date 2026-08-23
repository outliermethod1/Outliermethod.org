import { query, queryOne } from "./client";

export interface BylawDocument {
  id: string;
  state_code: string;
  blob_path: string;
  slug: string;
  effective_date: string;
  content_hash: string;
  source: "manual" | "crawler";
  watched_url_id: string | null;
  uploaded_at: string;
}

export async function insertDocument(doc: {
  state_code: string;
  blob_path: string;
  slug: string;
  effective_date: string;
  content_hash: string;
  source: "manual" | "crawler";
  watched_url_id?: string | null;
}): Promise<BylawDocument> {
  const row = await queryOne<BylawDocument>(
    `insert into bylaw_documents (state_code, blob_path, slug, effective_date, content_hash, source, watched_url_id)
     values ($1,$2,$3,$4,$5,$6,$7) returning *`,
    [
      doc.state_code.toLowerCase(),
      doc.blob_path,
      doc.slug,
      doc.effective_date,
      doc.content_hash,
      doc.source,
      doc.watched_url_id ?? null,
    ]
  );
  if (!row) throw new Error("Failed to insert document");
  return row;
}

export async function listDocuments(stateCode?: string): Promise<BylawDocument[]> {
  if (stateCode) {
    return query<BylawDocument>(
      `select * from bylaw_documents where state_code = $1 order by effective_date desc`,
      [stateCode.toLowerCase()]
    );
  }
  return query<BylawDocument>(`select * from bylaw_documents order by state_code, effective_date desc`);
}

export async function addCrawlerAlert(alert: {
  watched_url_id: string | null;
  state_code: string;
  kind: "404" | "stale" | "error";
  message: string;
}): Promise<void> {
  await query(
    `insert into crawler_alerts (watched_url_id, state_code, kind, message) values ($1,$2,$3,$4)`,
    [alert.watched_url_id, alert.state_code.toLowerCase(), alert.kind, alert.message]
  );
}

export async function listUnacknowledgedAlerts() {
  return query(`select * from crawler_alerts where acknowledged_at is null order by created_at desc`);
}
