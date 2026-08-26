# AD Chief of Staff (Outlier Method) — working notes

Next.js App Router + TypeScript + Postgres (Neon) + Anthropic API. Deployed on Vercel as
`outliermethod-org`, live at outliermethod.org. See `README.md` for setup/env vars.

## Gotchas

Real bugs hit in production during development, kept here so they don't get relearned.

### 1. TypeScript can't see across a DB driver or a font encoder

Two separate bugs, same root cause: **a type annotation is a claim, not a guarantee** — neither
`tsc` nor `next build` catches either of these. Both only surfaced by hitting the deployed endpoint.

- **`date` columns come back as JS `Date` objects at runtime**, not as the `string` the `User`/
  `BylawChunk`/etc. interfaces claim. `node-postgres` parses Postgres `date` (OID 1082) into a
  `Date` by default; calling `.slice()` or similar string methods on it throws. Fixed globally by
  overriding the type parser in `lib/db/client.ts`:
  `types.setTypeParser(1082, (val: string) => val)` — keeps `date` columns as plain `"YYYY-MM-DD"`
  strings everywhere, matching the TS types for real. `timestamptz` columns are unaffected by this
  and still come back as `Date` — don't assume the same fix covers them.

- **pdf-lib's standard fonts use WinAnsi encoding**, not full Unicode. Any character outside
  Latin-1 throws on `drawText` — most commonly an em dash (`—`), en dash (`–`), typographic minus
  (`−`, U+2212, distinct from ASCII hyphen), smart quotes (`‘’“”`), or an ellipsis (`…`). Eli's own
  answers use em dashes constantly, and any state-association handbook text pulled verbatim can
  contain any of these. Both PDF builders (`lib/export/pdf.ts`, `lib/export/forms.ts`) sanitize text
  before drawing via a `toWinAnsiSafe()` helper — **substitutes, never drops** (em dash → hyphen,
  curly quotes → straight, `…` → `...`), because this product's whole value is verbatim citable
  text; silently dropping a character corrupts a document whose accuracy is the product. If you add
  a third PDF-generating path, it needs the same sanitizer — this isn't automatically shared.

### 2. Persistence must never depend on whether anyone is still listening

`app/api/chat/route.ts` streams a response over SSE while writing to Postgres as it goes (message
save, citation log, free-tier quota increment, bylaw-watch enrollment). Originally, the DB writes
happened *after* the streaming loop finished. If the client disconnected mid-stream,
`controller.enqueue()` threw, which exited the `for await` loop via exception straight to the catch
block — **skipping persistence and the quota increment entirely**. For a paid feature gated by a
free-tier quota, that's a repeatable unlimited-free-answers exploit: ask a question, read the
streamed answer, disconnect before it finishes, and it never counts.

Fixed by decoupling generation-consumption from the client connection: `controller.enqueue()`
failures are swallowed per-delta so the upstream generation is always fully consumed, and
persistence/increment always run once generation completes — regardless of whether the client is
still attached. The general rule: **anything that must happen exactly once server-side (a charge, a
quota decrement, a write) cannot live in a code path that a client disconnect can skip.**

### 3. Two auth models coexist on purpose — know which one a route uses

- **Admin session**: httpOnly cookie (`ads_admin_session`), checked in `middleware.ts` against
  `ADMIN_COOKIE_NAME`. Persists across tabs within one browser session (cleared on full browser
  quit, not tab close).
- **Beta-tester / paid-user session**: token in the client's `sessionStorage` (see
  `lib/auth-client.ts`), sent as `Authorization: Bearer <token>` on API calls via `authFetch()`. This
  is deliberate — `sessionStorage` is genuinely per-tab, so opening a new tab starts logged out, per
  an explicit product requirement. This means **page navigations can't be gated server-side** (no
  header on a plain `GET`) — pages like `/coach` and `/profile` self-guard client-side on mount
  instead of relying on `middleware.ts`.

### 4. `middleware.ts` here is an **opt-in allowlist**, not a blanket gate with exemptions

`config.matcher` lists exactly the paths middleware runs on — everything else (including
`/api/stripe/webhook`) is untouched by default. **This is the opposite of reggie1's pattern**, where
middleware gates everything by default and exemptions are carved out via `OPEN_PATHS`. Reasoning by
analogy from reggie1 will get this backwards in either direction — check `matcher` here, don't
assume.

### 5. Vercel deploys are not instant — don't trust the first post-push check

A push to `main` auto-deploys, but there's real lag (typically 30–90s, sometimes longer) before the
new code is actually serving traffic. Testing immediately after a push against the old deployment
has produced false "still broken" reads more than once this project. Poll for a freshness signal
specific to the change (a new field in an API response, a new route existing, a changed error
message) rather than just re-hitting the same endpoint once — the endpoint responding at all doesn't
mean it's the *new* code responding, and DB migrations in particular have shown transient staleness
immediately after `ALTER TABLE` (Neon's pooled connections briefly serving a stale schema cache) —
if a migration reports success but a query against the new column/table fails right after, retry
once before assuming the migration itself failed.

## Architecture notes

- Single migration file (`migrations/001_init.sql`), re-run idempotently via `/api/bootstrap`
  (admin-only, `Authorization: Bearer <ADMIN_PASSWORD>`). `create table if not exists` for new
  tables; `alter table ... add column if not exists` for new columns on existing tables — **order
  matters**: an `alter table add column` must run before any `create index` on that column, since
  `create table if not exists` is a no-op on a table that already exists and won't pick up new
  columns on its own.
- Coach Eli's persona/behavior rules live in `lib/ai/prompt.ts` — one system prompt, two internal
  modes (strictly-grounded bylaw answers vs. freely-helpful operations), never surfaced to the user
  as a toggle.
- Bylaw retrieval is state-scoped by hard SQL filter before any vector/keyword search — the model
  never chooses the state, and a state's chunks are never visible cross-state.
