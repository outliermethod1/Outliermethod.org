# AD Chief of Staff — outliermethod.org

Coach Eli Govern: an AI assistant grounded in state association bylaws, plus the full operational
workload of running a high school or college athletic department.

Next.js (App Router, TypeScript) · Tailwind · Anthropic Claude (streaming) · Postgres/pgvector (Neon) ·
Vercel Blob · Vercel Cron · deployed on Vercel.

## How it works

- **`/`** — landing page.
- **`/coach`** — the chat. One window; Coach Eli reasons internally in two modes (bylaws/eligibility —
  strictly grounded and cited, vs. operations — freely helpful) but the split is invisible in the UI.
- **`/admin`** — password-gated. Review queue for crawler-detected bylaw changes, manual document
  upload, per-state configuration, index health.

The bylaw corpus is the foundation: source PDFs archive to Vercel Blob at
`bylaws/{state_code}/{YYYY-MM-DD}-{slug}.pdf` and are never queried directly. Ingestion parses each PDF
on its own section boundaries into `bylaw_chunks`, embeds each chunk, and — when a bulletin amends a
bylaw — supersedes the prior version rather than overwriting or deleting it. Retrieval always filters
`state_code` before any similarity search and always excludes `superseded_by IS NOT NULL` rows, so a
Colorado question can never surface a Texas bylaw and a superseded rule can never be cited as current.

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Provision infrastructure**
   - **Postgres**: add the Neon integration from your Vercel project (or point `DATABASE_URL` at any
     Postgres 15+ instance with the `vector` extension available).
   - **Vercel Blob**: create a Blob store in your Vercel project and copy its `BLOB_READ_WRITE_TOKEN`.
   - **Anthropic**: get an API key from console.anthropic.com.
   - **Voyage AI** (optional but recommended): get an API key from voyageai.com. Claude has no
     embeddings endpoint, so bylaw retrieval uses Voyage for the vector side of hybrid search. Without
     it, retrieval falls back to keyword-only search on `bylaw_id` and title/body — functional, but
     noticeably worse at answering natural-language questions that don't cite a section number.

3. **Copy `.env.example` to `.env`** and fill in the values above, plus:
   - `ADMIN_PASSWORD` — the shared password for `/admin`.
   - `ADMIN_SESSION_SECRET` — any long random string, used to sign the admin session cookie.
   - `CRON_SECRET` — optional; if set, the crawler endpoint only accepts requests carrying it as a
     bearer token. Vercel Cron sets this automatically once configured in your project settings.

4. **Run the migration**

   ```bash
   npm run db:migrate
   ```

5. **Seed one state end-to-end**

   ```bash
   npm run db:seed
   ```

   This seeds Colorado (CHSAA) with per-state config, two watched URLs, and a small set of bylaw
   sections — including a worked example of an amendment superseding a prior section, so you can see
   `superseded_by` in action immediately.

   **The seeded bylaw text is illustrative placeholder content**, written for this demo — it is not the
   real CHSAA handbook. Replace it before using the app for an actual eligibility determination: go to
   `/admin/documents` and upload the real, current handbook PDF for the state, or delete the seed rows
   and re-seed with your own state's config.

6. **Run the dev server**

   ```bash
   npm run dev
   ```

   Visit `/`, `/coach` (select Colorado), and `/admin` (sign in with `ADMIN_PASSWORD`).

## Populating all 50 states' config at once

```bash
npm run db:seed-all-states
```

This runs [scripts/seed-all-states.ts](scripts/seed-all-states.ts), which loads
[scripts/state-config-data.ts](scripts/state-config-data.ts) — a research pass across every state's
athletic/activities association (official name, eligibility contact, and handbook/bulletins URLs) — and
upserts it into `/admin/config`, including adding each state's handbook and bulletins pages as watched
URLs for the crawler.

**Read the caveats at the top of `state-config-data.ts` before trusting this in production:**

- Several official association sites blocked automated fetching during research; those entries are
  sourced from search-indexed snippets of the same page rather than a direct read. Each state's `notes`
  field flags this where it applies.
- Any contact field that couldn't be verified against an official page is `null` — nothing was guessed
  or fabricated. Expect gaps, especially on eligibility-specific emails (many associations route
  eligibility questions through the local school AD/principal by policy and don't publish one).
- Iowa splits governance by sex: this only seeds IHSAA (boys). Girls' athletics are governed separately
  by IGHSAU (ighsau.org) — add a second Iowa record if you need to distinguish them.
- California (CIF) is decentralized into 10 geographic Sections, each with its own bylaws on top of the
  state constitution and its own eligibility office. Only the state office is seeded.
- **This does not ingest any bylaw text.** It only sets up contact info and crawler watch targets. Every
  state except Colorado's illustrative demo will show up in `/coach` with no bylaws until you upload its
  real handbook via `/admin/documents`, or the crawler finds one and it clears the review queue.

Treat this as a strong first draft, not a finished directory — a state association reorganizing staff or
moving its handbook URL between seasons is normal, and this was gathered from one research pass. Spot-
check the states you're launching with first.

## Adding a new state

1. In `/admin/config`, add the state: code, name, association name, and eligibility contact (name,
   phone, email) — this renders below every Mode A answer for that state.
2. Add its watched URLs (handbook page, bulletins, board minutes, interpretation memos) — the crawler
   checks these daily via Vercel Cron and files anything changed into the review queue.
3. Upload its current handbook PDF via `/admin/documents` with the correct effective date. The
   ingestion pipeline parses it into section-aware chunks, categorizes each one, and embeds it (if
   `VOYAGE_API_KEY` is set).
4. Mid-year amendments: upload the bulletin PDF the same way, with its own effective date. Any section
   number that already exists for that state gets superseded automatically — the old version stays in
   the table (never deleted) so `resolve_as_of(date)` can reconstruct what the bylaws said on any past
   date, which matters when a determination made months ago gets challenged.

## The crawler

`app/api/cron/crawl/route.ts`, scheduled daily via `vercel.json`. For each watched URL: fetches it,
hashes the content, and if the hash changed, stages the new PDF in Blob and files a `review_queue`
entry with a diff summary — **it never writes to `bylaw_chunks` directly.** A human approves or rejects
from `/admin`; approval runs the same ingestion pipeline as a manual upload. A URL that 404s raises an
alert immediately; a URL that hasn't changed in ~90 consecutive daily checks also raises one, since
silent breakage on either end should surface as a notification, not as a wrong answer six months later.

## PDF export

Any conversation can be exported (`⇩` next to it in the left rail, or `GET /api/export?conversationId=`)
to a PDF capturing the question, the bylaws cited with their verbatim text and effective date, the
guidance disclaimer, and a timestamp — the paper trail if a determination is later challenged.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel. Add the Postgres (Neon) and Blob integrations from the Vercel dashboard —
   they'll set `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` automatically.
3. Set the remaining env vars (`ANTHROPIC_API_KEY`, `VOYAGE_API_KEY`, `ADMIN_PASSWORD`,
   `ADMIN_SESSION_SECRET`) in Project Settings → Environment Variables.
4. Deploy. Then run the migration and seed once against the production database (e.g. `vercel env pull`
   locally, then `npm run db:migrate && npm run db:seed`).
5. Confirm the cron job appears under Project Settings → Cron Jobs (it's declared in `vercel.json`).
6. Point `outliermethod.org` at the deployment under Project Settings → Domains.

## Guardrails encoded in the code, not just the prompt

- `lib/ai/retrieval.ts` filters `state_code` in SQL before any similarity search — the model never
  chooses or sees another state's bylaws.
- `superseded_by IS NULL` is a hard filter on every current-state retrieval query.
- Every Mode A answer's citations get logged to `chat_logs.retrieved_chunk_ids` (see
  `app/api/chat/route.ts`), so any determination can be reconstructed and audited later.
- The disclaimer + association contact block (`components/coach/DisclaimerBlock.tsx`) renders
  unconditionally whenever an answer carries citations — it's not something the model can be prompted
  into skipping, and there's no collapse/dismiss control in the component.
- `lib/rate-limit.ts` caps the chat endpoint per IP.
