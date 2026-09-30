import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/auth";
import { query } from "@/lib/db/client";

export const dynamic = "force-dynamic";

// Retires a governing body entirely — not just its chunks (see
// deleteChunksForState / clear-state for that), the states row itself, so it
// stops appearing in the state picker, /api/states, and comparisons.
// conversations/messages/escalations and bylaw_chunks/bylaw_documents/
// watched_urls/review_queue/schools/state_deadlines/bylaw_watches all cascade
// from states(state_code) — see migrations/001_init.sql. users.state_code has
// no cascade (an account shouldn't vanish because its state did), so it's
// nulled instead of blocking the delete.
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

  const { stateCode } = (await req.json()) as { stateCode?: string };
  if (!stateCode) {
    return NextResponse.json({ error: "stateCode is required" }, { status: 400 });
  }
  const code = stateCode.toLowerCase();

  try {
    const conversationsDeleted = await query<{ id: string }>(
      `delete from conversations where state_code = $1 returning id`,
      [code]
    );
    const usersDetached = await query<{ id: string }>(
      `update users set state_code = null where state_code = $1 returning id`,
      [code]
    );
    const waitlistDeleted = await query<{ id: string }>(
      `delete from waitlist_signups where state_code = $1 returning id`,
      [code]
    );
    const statesDeleted = await query<{ state_code: string }>(
      `delete from states where state_code = $1 returning state_code`,
      [code]
    );

    if (statesDeleted.length === 0) {
      return NextResponse.json({
        state_code: code,
        status: "not_found",
        detail: "No states row for this code — already removed, or it was config-only and never seeded.",
      });
    }

    return NextResponse.json({
      state_code: code,
      status: "removed",
      conversations_deleted: conversationsDeleted.length,
      users_detached: usersDetached.length,
      waitlist_signups_deleted: waitlistDeleted.length,
    });
  } catch (err) {
    console.error(`remove-governing-body failed for ${code}:`, err);
    return NextResponse.json(
      { state_code: code, status: "error", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
