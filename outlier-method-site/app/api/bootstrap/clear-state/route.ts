import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/auth";
import { deleteChunksForState } from "@/lib/db/chunks";

export const dynamic = "force-dynamic";

// Discards every chunk on file for a state — for undoing a bad auto-ingest
// (e.g. the ingest-handbook one-hop fallback landed on the wrong document)
// so it can be cleanly re-ingested from scratch. Same auth pattern as the
// rest of /api/bootstrap/*.
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

  try {
    const deleted = await deleteChunksForState(stateCode);
    return NextResponse.json({ ok: true, state_code: stateCode, deleted });
  } catch (err) {
    console.error(`clear-state failed for ${stateCode}:`, err);
    return NextResponse.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
