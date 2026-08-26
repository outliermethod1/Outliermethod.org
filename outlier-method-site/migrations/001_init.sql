-- AD Chief of Staff — bylaw corpus + chat schema

create extension if not exists vector;
create extension if not exists pgcrypto;

-- Per-state association configuration
create table if not exists states (
  state_code text primary key,
  state_name text not null,
  association_name text not null,
  eligibility_contact_name text,
  eligibility_contact_phone text,
  eligibility_contact_email text,
  level text not null default 'high_school', -- 'high_school' | 'college' — lets /coach and /bylaws filter the picker
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table states add column if not exists level text not null default 'high_school';

-- URLs the crawler watches per state (handbook page, bulletins, board minutes, memos)
create table if not exists watched_urls (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references states(state_code) on delete cascade,
  url text not null,
  label text not null,
  last_checked_at timestamptz,
  last_changed_at timestamptz,
  last_status text, -- 'ok' | 'unchanged' | 'error_404' | 'error_other'
  consecutive_failures int not null default 0,
  consecutive_unchanged_checks int not null default 0,
  content_hash text,
  created_at timestamptz not null default now()
);

-- Archive/audit trail: every source PDF, published or pending review
create table if not exists bylaw_documents (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references states(state_code) on delete cascade,
  blob_path text not null,
  slug text not null,
  effective_date date not null,
  content_hash text not null,
  source text not null default 'manual', -- 'manual' | 'crawler'
  watched_url_id uuid references watched_urls(id) on delete set null,
  uploaded_at timestamptz not null default now()
);

-- The resolved index. Chunked on document section boundaries.
create table if not exists bylaw_chunks (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references states(state_code) on delete cascade,
  document_id uuid references bylaw_documents(id) on delete cascade,
  bylaw_id text not null,
  title text not null,
  body text not null,
  effective_date date not null,
  superseded_by uuid references bylaw_chunks(id),
  source_doc text not null,
  source_page int,
  category text not null default 'other',
  embedding vector(1024),
  created_at timestamptz not null default now()
);

create index if not exists bylaw_chunks_state_idx on bylaw_chunks(state_code);
create index if not exists bylaw_chunks_current_idx on bylaw_chunks(state_code) where superseded_by is null;
create index if not exists bylaw_chunks_bylaw_id_idx on bylaw_chunks(state_code, bylaw_id);
create index if not exists bylaw_chunks_effective_idx on bylaw_chunks(state_code, effective_date);
create index if not exists bylaw_chunks_embedding_idx on bylaw_chunks
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

-- Crawler-detected changes awaiting human review before they can enter the index
create table if not exists review_queue (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references states(state_code) on delete cascade,
  watched_url_id uuid references watched_urls(id) on delete set null,
  blob_path text not null,
  content_hash text not null,
  diff_summary text,
  status text not null default 'pending', -- 'pending' | 'approved' | 'rejected'
  detected_at timestamptz not null default now(),
  reviewed_at timestamptz,
  effective_date date
);

-- Alerts for silent crawler breakage (404s, stale watched URLs)
create table if not exists crawler_alerts (
  id uuid primary key default gen_random_uuid(),
  watched_url_id uuid references watched_urls(id) on delete cascade,
  state_code text not null,
  kind text not null, -- '404' | 'stale' | 'error'
  message text not null,
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz
);

-- One-tap "report this exchange" — ships the permanent audit record
-- straight to the admin queue instead of the user having to argue with
-- Eli in the moment about what he said.
create table if not exists escalations (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  conversation_id uuid not null references conversations(id) on delete cascade,
  reporter_note text,
  status text not null default 'open', -- 'open' | 'resolved'
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists escalations_status_idx on escalations (status, created_at);

-- Member schools, sourced from each state association's official classification/
-- realignment list (not MaxPreps — the association is the authority on its own
-- classification, and there's no public MaxPreps API to pull from anyway).
-- Looked up on demand via a chat tool rather than stuffed into every prompt —
-- a state can have thousands of schools.
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references states(state_code) on delete cascade,
  name text not null,
  city text,
  classification text, -- e.g. "5A", "Class 3A", "Division II" — association-specific
  district_region text, -- league/region/section name, association-specific
  sports_sponsored text[],
  source text not null default 'manual', -- 'manual' | 'crawler' | 'research'
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (state_code, name)
);
create index if not exists schools_state_name_idx on schools (state_code, name);

-- Beta tester accounts. A signup fires an email to the admin's list address
-- (see lib/email.ts) and requires the user to verify their own email before
-- logging in.
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  email_verified boolean not null default false,
  verification_token text,
  verification_expires timestamptz,
  name text,
  school text,
  state_code text references states(state_code),
  avatar_url text,
  signature text, -- how they sign emails; Eli signs drafted emails with this when it's on file
  reset_token text,
  reset_expires timestamptz,
  voice_enabled boolean not null default false, -- premium toggle: read Eli's answers aloud via ElevenLabs
  stripe_customer_id text,
  subscription_status text not null default 'free', -- 'free' | 'active' | 'past_due' | 'canceled'
  subscription_tier text, -- 'ad' | 'district', null while free
  is_founding_member boolean not null default false,
  founding_code_used text,
  cited_answer_count int not null default 0, -- resets monthly; free-tier quota (Mode A answers only)
  cited_answer_count_reset_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table users add column if not exists signature text;
alter table users add column if not exists reset_token text;
alter table users add column if not exists reset_expires timestamptz;
alter table users add column if not exists voice_enabled boolean not null default false;
alter table users add column if not exists stripe_customer_id text;
alter table users add column if not exists subscription_status text not null default 'free';
alter table users add column if not exists subscription_tier text;
alter table users add column if not exists is_founding_member boolean not null default false;
alter table users add column if not exists founding_code_used text;
alter table users add column if not exists cited_answer_count int not null default 0;
alter table users add column if not exists cited_answer_count_reset_at timestamptz not null default now();
create index if not exists users_verification_token_idx on users (verification_token);
create index if not exists users_reset_token_idx on users (reset_token);
create index if not exists users_stripe_customer_id_idx on users (stripe_customer_id);

-- Anonymous visitor sessions — lets someone use Coach Eli for a handful of
-- free questions before an account exists. id is the value carried in the
-- signed ads_anon_session cookie (lib/anon-session.ts); ip_hash is a soft
-- secondary counter (see lib/anon-quota.ts) so clearing cookies doesn't
-- trivially reset the free quota, without hard-blocking shared/NAT'd IPs.
create table if not exists anon_sessions (
  id uuid primary key,
  exchange_count int not null default 0,
  ip_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists anon_ip_usage (
  ip_hash text primary key,
  exchange_count int not null default 0,
  updated_at timestamptz not null default now()
);

-- Conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references states(state_code),
  title text not null default 'New conversation',
  user_id uuid references users(id) on delete cascade,
  anon_session_id uuid references anon_sessions(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table conversations add column if not exists user_id uuid references users(id) on delete cascade;
alter table conversations add column if not exists anon_session_id uuid references anon_sessions(id) on delete cascade;
create index if not exists conversations_user_id_idx on conversations (user_id);
create index if not exists conversations_anon_session_id_idx on conversations (anon_session_id);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references conversations(id) on delete cascade,
  role text not null, -- 'user' | 'assistant'
  content text not null,
  mode text, -- 'A' | 'B' | 'mixed', assistant messages only
  created_at timestamptz not null default now()
);

-- Audit log: which chunks backed a given Mode A answer
create table if not exists chat_logs (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null references messages(id) on delete cascade,
  retrieved_chunk_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Failed/successful admin login attempts, for rate limiting and lockout
-- (see app/api/admin/login/route.ts). Durable in Postgres rather than
-- in-memory since serverless instances don't share memory across requests.
create table if not exists admin_login_attempts (
  id uuid primary key default gen_random_uuid(),
  ip text not null,
  success boolean not null,
  created_at timestamptz not null default now()
);
create index if not exists admin_login_attempts_ip_time_idx on admin_login_attempts (ip, created_at);

-- Prebuilt operational document templates, browsable at /forms. Separate
-- from Coach Eli's on-demand drafting (Mode B) — this is a quick-reference
-- library of starter templates an AD can copy without opening a chat.
create table if not exists form_templates (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  level text not null, -- 'high_school' | 'college'
  category text not null,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists form_templates_level_idx on form_templates (level, category);

-- Recurring, admin-managed bylaw deadlines per state — the "compliance
-- calendar" layer on top of the bylaw corpus. month/day repeats every year;
-- this is deliberately a manually-curated starter set per state (auto-
-- extracting deadlines from raw bylaw text across 55 governing bodies
-- reliably is a much bigger project) rather than derived automatically.
create table if not exists state_deadlines (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references states(state_code) on delete cascade,
  title text not null,
  description text,
  month int not null, -- 1-12
  day int not null, -- 1-31
  category text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists state_deadlines_state_idx on state_deadlines (state_code, month, day);

-- Personal reminders a user saves — either self-added, or saved by Eli via
-- the save_deadline tool when he states a concrete, dated deadline in an
-- answer (source_message_id links back to that exact exchange/audit record).
create table if not exists user_deadlines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  description text,
  due_date date not null,
  source_message_id uuid references messages(id) on delete set null,
  created_at timestamptz not null default now()
);

-- District/PO buyers: public schools mostly can't pay by card. This is the
-- "request an invoice" path — lands in the admin queue for Ryan to invoice
-- net-30 by hand rather than trying to automate purchase-order procurement.
create table if not exists invoice_requests (
  id uuid primary key default gen_random_uuid(),
  school_or_district text not null,
  contact_name text not null,
  contact_email text not null,
  tier text not null, -- 'ad' | 'district'
  school_count int,
  note text,
  status text not null default 'open', -- 'open' | 'invoiced' | 'paid' | 'closed'
  created_at timestamptz not null default now()
);
create index if not exists invoice_requests_status_idx on invoice_requests (status, created_at);

-- Founding-cohort signup codes (20 ADs, free for a year) — tracked
-- separately from paid usage so Ryan can see cohort activity distinctly.
create table if not exists founding_codes (
  code text primary key,
  max_uses int not null default 1,
  used_count int not null default 0,
  note text,
  created_at timestamptz not null default now()
);

-- Waitlist capture — a state/topic not covered yet, or "notify me when
-- [state] amends this rule." Doubles as the roadmap: build what people
-- actually ask for.
create table if not exists waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  state_code text,
  bylaw_id text, -- set for a specific "notify me on amendment" signup
  kind text not null default 'state_coverage', -- 'state_coverage' | 'bylaw_amendment'
  notified_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists waitlist_signups_state_idx on waitlist_signups (state_code, bylaw_id);

-- Which bylaws a user has actually been cited on — powers amendment alerts.
-- Auto-recorded whenever a Mode A answer cites a bylaw for a logged-in user;
-- when that bylaw is later superseded (admin approves an amendment), every
-- watcher gets notified instead of finding out the hard way next season.
create table if not exists bylaw_watches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  state_code text not null references states(state_code) on delete cascade,
  bylaw_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, state_code, bylaw_id)
);
create index if not exists bylaw_watches_lookup_idx on bylaw_watches (state_code, bylaw_id);
create index if not exists user_deadlines_user_idx on user_deadlines (user_id, due_date);
