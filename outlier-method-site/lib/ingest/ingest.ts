import crypto from "crypto";
import { put } from "@vercel/blob";
import { parsePdf, chunkIntoSections } from "./parse";
import { categorize } from "./categorize";
import { insertChunkAndSupersede } from "../db/chunks";
import { insertDocument } from "../db/documents";
import { embedTexts, embeddingsAvailable } from "../ai/embeddings";

export function hashBuffer(buffer: Buffer): string {
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

export function blobPath(stateCode: string, effectiveDate: string, slug: string): string {
  return `bylaws/${stateCode.toLowerCase()}/${effectiveDate}-${slug}.pdf`;
}

/**
 * Ingest a single PDF: archive it to Blob, parse + chunk it, embed each
 * chunk, and insert new chunk versions (superseding prior current versions
 * with the same bylaw_id). Never deletes — historical versions stay queryable
 * via resolve_as_of.
 */
export async function ingestPdf(opts: {
  stateCode: string;
  effectiveDate: string;
  slug: string;
  buffer: Buffer;
  source: "manual" | "crawler";
  watchedUrlId?: string | null;
}): Promise<{ documentId: string; chunkCount: number }> {
  const path = blobPath(opts.stateCode, opts.effectiveDate, opts.slug);
  const contentHash = hashBuffer(opts.buffer);

  const blob = await put(path, opts.buffer, { access: "public", addRandomSuffix: false });

  const document = await insertDocument({
    state_code: opts.stateCode,
    blob_path: blob.url,
    slug: opts.slug,
    effective_date: opts.effectiveDate,
    content_hash: contentHash,
    source: opts.source,
    watched_url_id: opts.watchedUrlId ?? null,
  });

  const { pages } = await parsePdf(opts.buffer);
  const sections = chunkIntoSections(pages);

  const embeddings = embeddingsAvailable()
    ? await embedTexts(
        sections.map((s) => `${s.title}\n${s.body}`),
        "document"
      )
    : sections.map(() => null);

  let chunkCount = 0;
  for (let i = 0; i < sections.length; i++) {
    const s = sections[i];
    await insertChunkAndSupersede({
      state_code: opts.stateCode,
      document_id: document.id,
      bylaw_id: s.bylaw_id,
      title: s.title,
      body: s.body,
      effective_date: opts.effectiveDate,
      source_doc: blob.url,
      source_page: s.page,
      category: categorize(s.title, s.body),
      embedding: embeddings[i],
    });
    chunkCount++;
  }

  return { documentId: document.id, chunkCount };
}
