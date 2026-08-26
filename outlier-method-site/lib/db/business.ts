import { query, queryOne } from "./client";

// --- Invoice / PO requests (districts that can't pay by card) ---

export interface InvoiceRequest {
  id: string;
  school_or_district: string;
  contact_name: string;
  contact_email: string;
  tier: "ad" | "district";
  school_count: number | null;
  note: string | null;
  status: "open" | "invoiced" | "paid" | "closed";
  created_at: string;
}

export async function createInvoiceRequest(input: {
  schoolOrDistrict: string;
  contactName: string;
  contactEmail: string;
  tier: "ad" | "district";
  schoolCount?: number | null;
  note?: string | null;
}): Promise<InvoiceRequest> {
  const row = await queryOne<InvoiceRequest>(
    `insert into invoice_requests (school_or_district, contact_name, contact_email, tier, school_count, note)
     values ($1,$2,$3,$4,$5,$6) returning *`,
    [
      input.schoolOrDistrict,
      input.contactName,
      input.contactEmail,
      input.tier,
      input.schoolCount ?? null,
      input.note ?? null,
    ]
  );
  if (!row) throw new Error("Failed to create invoice request");
  return row;
}

export async function listInvoiceRequests(): Promise<InvoiceRequest[]> {
  return query<InvoiceRequest>(`select * from invoice_requests order by created_at desc`);
}

export async function setInvoiceRequestStatus(id: string, status: InvoiceRequest["status"]): Promise<void> {
  await query(`update invoice_requests set status = $2 where id = $1`, [id, status]);
}

// --- Founding-cohort codes ---

export interface FoundingCode {
  code: string;
  max_uses: number;
  used_count: number;
  note: string | null;
  created_at: string;
}

export async function createFoundingCode(code: string, maxUses: number, note?: string): Promise<FoundingCode> {
  const row = await queryOne<FoundingCode>(
    `insert into founding_codes (code, max_uses, note) values ($1,$2,$3) returning *`,
    [code.trim(), maxUses, note ?? null]
  );
  if (!row) throw new Error("Failed to create founding code");
  return row;
}

export async function listFoundingCodes(): Promise<FoundingCode[]> {
  return query<FoundingCode>(`select * from founding_codes order by created_at desc`);
}

// --- Waitlist ---

export async function addWaitlistSignup(input: {
  email: string;
  stateCode?: string | null;
  bylawId?: string | null;
  kind: "state_coverage" | "bylaw_amendment";
}): Promise<void> {
  await query(
    `insert into waitlist_signups (email, state_code, bylaw_id, kind) values ($1,$2,$3,$4)`,
    [input.email.toLowerCase().trim(), input.stateCode ?? null, input.bylawId ?? null, input.kind]
  );
}

export interface WaitlistSummary {
  state_code: string | null;
  kind: string;
  count: string;
}

export async function waitlistDemandByState(): Promise<WaitlistSummary[]> {
  return query<WaitlistSummary>(
    `select state_code, kind, count(*)::text as count
     from waitlist_signups
     group by state_code, kind
     order by count(*) desc`
  );
}

// --- Bylaw watches (amendment alerts) ---

export async function recordBylawWatch(userId: string, stateCode: string, bylawId: string): Promise<void> {
  await query(
    `insert into bylaw_watches (user_id, state_code, bylaw_id) values ($1,$2,$3)
     on conflict (user_id, state_code, bylaw_id) do nothing`,
    [userId, stateCode.toLowerCase(), bylawId]
  );
}

export interface WatcherEmail {
  user_id: string;
  email: string;
  name: string | null;
}

/** Everyone watching a given bylaw_id in a state — used when it gets superseded. */
export async function watchersForBylaw(stateCode: string, bylawId: string): Promise<WatcherEmail[]> {
  return query<WatcherEmail>(
    `select w.user_id, u.email, u.name
     from bylaw_watches w
     join users u on u.id = w.user_id
     where w.state_code = $1 and w.bylaw_id = $2`,
    [stateCode.toLowerCase(), bylawId]
  );
}
