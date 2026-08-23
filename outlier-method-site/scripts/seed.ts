// Seeds one state end-to-end so the app is demonstrable immediately.
//
// IMPORTANT: the bylaw text below is illustrative placeholder content written
// for this demo — it is NOT the real CHSAA handbook. Before using this app
// for an actual eligibility determination, replace it via /admin/documents
// with the real, current handbook PDF for the state.

import { upsertState } from "../lib/db/states";
import { addWatchedUrl } from "../lib/db/watched-urls";
import { insertDocument } from "../lib/db/documents";
import { insertChunkAndSupersede } from "../lib/db/chunks";
import { embedTexts, embeddingsAvailable } from "../lib/ai/embeddings";
import { categorize } from "../lib/ingest/categorize";
import { getPool } from "../lib/db/client";

const STATE_CODE = "co";

const SAMPLE_SECTIONS: { bylaw_id: string; title: string; body: string; effective_date: string }[] = [
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

// A worked example of supersession: 1730.1 gets amended mid-year by a bulletin.
const AMENDMENT = {
  bylaw_id: "1730.1",
  title: "Transfer Eligibility — General Rule (Amended)",
  body: "A student who transfers from one member school to another member school without a corresponding change of residence by the student's parent(s) or legal guardian(s) shall be ineligible for varsity competition for a period of 180 days from the date of enrollment at the new school, unless the transfer qualifies for an exception under Bylaw 1730.2 or a hardship waiver is granted under Bylaw 1735. This bulletin reduces the sit-out period from 365 days to 180 days effective for the 2026-27 school year.",
  effective_date: "2026-09-15",
};

async function main() {
  await upsertState({
    state_code: STATE_CODE,
    state_name: "Colorado",
    association_name: "Colorado High School Activities Association (CHSAA)",
    eligibility_contact_name: "CHSAA Eligibility Office",
    eligibility_contact_phone: "(303) 344-5050",
    eligibility_contact_email: "eligibility@chsaa.org",
  });

  await addWatchedUrl(
    STATE_CODE,
    "https://www.chsaa.org/handbook",
    "CHSAA Handbook — Bylaws & Regulations"
  );
  await addWatchedUrl(STATE_CODE, "https://www.chsaa.org/bulletins", "CHSAA Bulletins & Amendments");

  const document = await insertDocument({
    state_code: STATE_CODE,
    blob_path: "seed://chsaa-handbook-2026-07-01.pdf",
    slug: "handbook",
    effective_date: "2026-07-01",
    content_hash: "seed-handbook",
    source: "manual",
  });

  const useEmbeddings = embeddingsAvailable();
  console.log(useEmbeddings ? "Embedding seed chunks via Voyage AI…" : "VOYAGE_API_KEY not set — seeding without embeddings (keyword search only).");

  const embeddings = useEmbeddings
    ? await embedTexts(
        SAMPLE_SECTIONS.map((s) => `${s.title}\n${s.body}`),
        "document"
      )
    : SAMPLE_SECTIONS.map(() => null);

  for (let i = 0; i < SAMPLE_SECTIONS.length; i++) {
    const s = SAMPLE_SECTIONS[i];
    await insertChunkAndSupersede({
      state_code: STATE_CODE,
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
    state_code: STATE_CODE,
    blob_path: "seed://chsaa-bulletin-2026-09-15.pdf",
    slug: "bulletin-amendments",
    effective_date: AMENDMENT.effective_date,
    content_hash: "seed-bulletin",
    source: "manual",
  });

  const [amendmentEmbedding] = useEmbeddings
    ? await embedTexts([`${AMENDMENT.title}\n${AMENDMENT.body}`], "document")
    : [null];

  await insertChunkAndSupersede({
    state_code: STATE_CODE,
    document_id: amendmentDocument.id,
    bylaw_id: AMENDMENT.bylaw_id,
    title: AMENDMENT.title,
    body: AMENDMENT.body,
    effective_date: AMENDMENT.effective_date,
    source_doc: amendmentDocument.blob_path,
    source_page: 1,
    category: categorize(AMENDMENT.title, AMENDMENT.body),
    embedding: amendmentEmbedding,
  });

  console.log(`Seeded ${STATE_CODE.toUpperCase()} with ${SAMPLE_SECTIONS.length + 1} chunks (1 superseded).`);
  await getPool().end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
