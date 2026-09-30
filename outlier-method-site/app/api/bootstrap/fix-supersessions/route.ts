import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/auth";
import { query } from "@/lib/db/client";

export const dynamic = "force-dynamic";

// One-time corrective migration for a bug in insertChunkAndSupersede: before
// it was scoped to require a different document_id, a single document's own
// chunker pass could supersede its OWN earlier chunks whenever two unrelated
// sections coincidentally reused the same small numeric bylaw_id (e.g.
// MHSAA's "Section 1—Enrollment" vs., later in the same handbook, sport-list
// entry "1. BASEBALL" — both bylaw_id "1"). That silently hid real,
// never-amended content behind an unrelated later section. This finds every
// such wrongly-superseded chunk — superseded_by pointing at a chunk that
// shares its own document_id — and un-hides it. Idempotent; safe to re-run.
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const token = auth?.replace(/^Bearer\s+/i, "");

  let passwordOk: boolean;
  try {
    passwordOk = !!token && checkAdminPassword(token);
  } catch {
    return NextResponse.json({ error: "ADMIN_PASSWORD is not set on this deployment yet." }, { status: 500 });
  }
  if (!passwordOk) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const restored = await query<{ id: string; state_code: string }>(
      `update bylaw_chunks as old
         set superseded_by = null
       from bylaw_chunks as new
       where old.superseded_by = new.id
         and old.document_id is not null
         and old.document_id = new.document_id
       returning old.id, old.state_code`
    );

    const byState: Record<string, number> = {};
    for (const row of restored) {
      byState[row.state_code] = (byState[row.state_code] ?? 0) + 1;
    }

    return NextResponse.json({ ok: true, total_restored: restored.length, by_state: byState });
  } catch (err) {
    console.error("fix-supersessions failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
