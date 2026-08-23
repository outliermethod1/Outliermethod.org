import fs from "fs";
import path from "path";
import { getPool, query } from "../db/client";
import { upsertState } from "../db/states";
import { addWatchedUrl, listWatchedUrls } from "../db/watched-urls";
import { insertDocument } from "../db/documents";
import { insertChunkAndSupersede } from "../db/chunks";
import { embedTexts, embeddingsAvailable } from "../ai/embeddings";
import { categorize } from "../ingest/categorize";
import { ingestPdf } from "../ingest/ingest";
import { STATE_CONFIG_DATA } from "../../scripts/state-config-data";

export async function runMigration(): Promise<string> {
  const sql = fs.readFileSync(path.join(process.cwd(), "migrations/001_init.sql"), "utf-8");
  await getPool().query(sql);
  return "Migration applied.";
}

const CO_SAMPLE_SECTIONS = [
  {
    bylaw_id: "1730.1",
    title: "Transfer Eligibility — General Rule",
    body: "A student who transfers from one member school to another member school without a corresponding change of residence by the student's parent(s) or legal guardian(s) shall be ineligible for varsity competition for a period of 365 days from the date of enrollment at the new school, unless the transfer qualifies for an exception under Bylaw 1730.2 or a hardship waiver is granted under Bylaw 1735.",
    effective_date: "2026-07-01",
  },
  {
    bylaw_id: "1730.2",
    title: "Transfer Eligibility — Bona Fide Change of Residence",
    body: "A student whose parent(s) or legal guardian(s) make a complete, bona fide change of residence to the attendance area of the new school shall be immediately eligible, provided the student has had no contact, direct or indirect, with a coach at the new school regarding the transfer prior to the residence change. The member school shall document the change of residence with two forms of proof, which may include a signed lease or deed, a utility bill, or a voter registration card.",
    effective_date: "2026-07-01",
  },
  {
    bylaw_id: "1745.0",
    title: "Undue Influence",
    body: "Undue influence is the use of authority or persuasion by any person connected, directly or indirectly, with a member school to encourage or entice a student, or the parent(s) or guardian(s) of a student, to transfer from one school to another for athletic reasons. A finding of undue influence shall render the student ineligible for a period to be determined by the Commissioner's office, and may subject the member school to sanctions under Bylaw 2100.",
    effective_date: "2026-07-01",
  },
  {
    bylaw_id: "1750.0",
    title: "Eight-Semester Rule",
    body: "A student shall be eligible for interscholastic athletic competition for a maximum of eight consecutive semesters beginning with the student's initial enrollment in the ninth grade. Semesters need not be consecutive due to illness or accident, subject to written verification submitted to the member school's athletic director.",
    effective_date: "2026-07-01",
  },
  {
    bylaw_id: "1760.0",
    title: "Academic Eligibility",
    body: "To be eligible to participate in interscholastic athletics, a student must be enrolled in and passing a minimum of five subjects of unit weight, or the equivalent, at the close of the grading period immediately preceding the week of participation. Eligibility is checked weekly and applies from Monday through Sunday of the following week.",
    effective_date: "2026-07-01",
  },
];

const CO_AMENDMENT = {
  bylaw_id: "1730.1",
  title: "Transfer Eligibility — General Rule (Amended)",
  body: "A student who transfers from one member school to another member school without a corresponding change of residence by the student's parent(s) or legal guardian(s) shall be ineligible for varsity competition for a period of 180 days from the date of enrollment at the new school, unless the transfer qualifies for an exception under Bylaw 1730.2 or a hardship waiver is granted under Bylaw 1735. This bulletin reduces the sit-out period from 365 days to 180 days effective for the 2026-27 school year.",
  effective_date: "2026-09-15",
};

/** Idempotent: skips if Colorado already has bylaw_chunks (i.e. already seeded). */
export async function seedColoradoDemo(): Promise<string> {
  const existing = await query<{ count: string }>(
    `select count(*)::text as count from bylaw_chunks where state_code = 'co'`
  );
  if (Number(existing[0]?.count ?? 0) > 0) {
    return "Colorado demo bylaws already present — skipped.";
  }

  await upsertState({
    state_code: "co",
    state_name: "Colorado",
    association_name: "Colorado High School Activities Association (CHSAA)",
    eligibility_contact_name: "CHSAA Office",
    eligibility_contact_phone: "(303) 344-5050",
    eligibility_contact_email: null,
  });

  const document = await insertDocument({
    state_code: "co",
    blob_path: "seed://chsaa-handbook-2026-07-01.pdf",
    slug: "handbook",
    effective_date: "2026-07-01",
    content_hash: "seed-handbook",
    source: "manual",
  });

  const useEmbeddings = embeddingsAvailable();
  const embeddings = useEmbeddings
    ? await embedTexts(
        CO_SAMPLE_SECTIONS.map((s) => `${s.title}\n${s.body}`),
        "document"
      )
    : CO_SAMPLE_SECTIONS.map(() => null);

  for (let i = 0; i < CO_SAMPLE_SECTIONS.length; i++) {
    const s = CO_SAMPLE_SECTIONS[i];
    await insertChunkAndSupersede({
      state_code: "co",
      document_id: document.id,
      bylaw_id: s.bylaw_id,
      title: s.title,
      body: s.body,
      effective_date: s.effective_date,
      source_doc: document.blob_path,
      source_page: i + 1,
      category: categorize(s.title, s.body),
      embedding: embeddings[i],
    });
  }

  const amendmentDocument = await insertDocument({
    state_code: "co",
    blob_path: "seed://chsaa-bulletin-2026-09-15.pdf",
    slug: "bulletin-amendments",
    effective_date: CO_AMENDMENT.effective_date,
    content_hash: "seed-bulletin",
    source: "manual",
  });

  const [amendmentEmbedding] = useEmbeddings
    ? await embedTexts([`${CO_AMENDMENT.title}\n${CO_AMENDMENT.body}`], "document")
    : [null];

  await insertChunkAndSupersede({
    state_code: "co",
    document_id: amendmentDocument.id,
    bylaw_id: CO_AMENDMENT.bylaw_id,
    title: CO_AMENDMENT.title,
    body: CO_AMENDMENT.body,
    effective_date: CO_AMENDMENT.effective_date,
    source_doc: amendmentDocument.blob_path,
    source_page: 1,
    category: categorize(CO_AMENDMENT.title, CO_AMENDMENT.body),
    embedding: amendmentEmbedding,
  });

  return `Seeded Colorado with ${CO_SAMPLE_SECTIONS.length + 1} demo bylaw chunks (illustrative placeholder text).`;
}

/** Idempotent: upsertState always updates in place; watched URLs are skipped if already present. */
export async function seedAllStates(): Promise<string> {
  const existing = await listWatchedUrls();
  const existingKey = new Set(existing.map((u) => `${u.state_code}:${u.url}`));

  for (const s of STATE_CONFIG_DATA) {
    await upsertState({
      state_code: s.state_code,
      state_name: s.state_name,
      association_name: s.association_name,
      eligibility_contact_name: s.eligibility_contact_name,
      eligibility_contact_phone: s.eligibility_contact_phone,
      eligibility_contact_email: s.eligibility_contact_email,
    });

    const urls: { url: string; label: string }[] = [
      { url: s.handbook_url, label: `${s.association_name.split(" (")[0]} Handbook / Bylaws` },
    ];
    if (s.bulletins_url) {
      urls.push({ url: s.bulletins_url, label: `${s.association_name.split(" (")[0]} Bulletins / Amendments` });
    }

    for (const u of urls) {
      const key = `${s.state_code}:${u.url}`;
      if (existingKey.has(key)) continue;
      await addWatchedUrl(s.state_code, u.url, u.label);
      existingKey.add(key);
    }
  }

  return `Config seeded for ${STATE_CONFIG_DATA.length} states.`;
}

export interface HandbookIngestResult {
  state_code: string;
  status: "ingested" | "already_present" | "not_a_pdf" | "fetch_failed";
  detail: string;
}

/**
 * Fetches a single state's researched handbook_url and, if it's an actual
 * PDF, runs it through the real ingestion pipeline (parse, chunk, embed).
 * Skips states that already have chunks — this is meant for states that
 * only have the illustrative demo (i.e. none, except Colorado) or nothing
 * yet. Many researched URLs are HTML landing pages rather than direct PDF
 * links; those are reported as "not_a_pdf" rather than guessed at.
 */
export async function ingestRealHandbook(stateCode: string): Promise<HandbookIngestResult> {
  const entry = STATE_CONFIG_DATA.find((s) => s.state_code === stateCode.toLowerCase());
  if (!entry) {
    return { state_code: stateCode, status: "fetch_failed", detail: "No researched config for this state code." };
  }

  const existing = await query<{ count: string }>(
    `select count(*)::text as count from bylaw_chunks where state_code = $1`,
    [stateCode.toLowerCase()]
  );
  if (Number(existing[0]?.count ?? 0) > 0) {
    return { state_code: stateCode, status: "already_present", detail: "Chunks already exist — skipped." };
  }

  let res: Response;
  try {
    res = await fetch(entry.handbook_url, { redirect: "follow" });
  } catch (err) {
    return {
      state_code: stateCode,
      status: "fetch_failed",
      detail: `Fetch error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
  if (!res.ok) {
    return { state_code: stateCode, status: "fetch_failed", detail: `HTTP ${res.status} from ${entry.handbook_url}` };
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "";
  const looksLikePdf = contentType.includes("pdf") || buffer.subarray(0, 5).toString("latin1") === "%PDF-";
  if (!looksLikePdf) {
    return {
      state_code: stateCode,
      status: "not_a_pdf",
      detail: `${entry.handbook_url} returned content-type "${contentType}" — likely an HTML landing page, not a direct PDF. Needs a corrected URL via /admin/documents or /admin/config.`,
    };
  }

  const result = await ingestPdf({
    stateCode,
    effectiveDate: new Date().toISOString().slice(0, 10),
    slug: "handbook",
    buffer,
    source: "crawler",
  });

  return {
    state_code: stateCode,
    status: "ingested",
    detail: `Ingested ${result.chunkCount} sections from ${entry.handbook_url}. Effective date set to today — correct it via a fresh upload with the handbook's real effective date once known.`,
  };
}
