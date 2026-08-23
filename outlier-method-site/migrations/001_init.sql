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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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

-- Conversations
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  state_code text not null references states(state_code),
  title text not null default 'New conversation',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists users_verification_token_idx on users (verification_token);
