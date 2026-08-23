import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/auth";
import { runMigration, seedColoradoDemo, seedAllStates } from "@/lib/setup/bootstrap";

export const dynamic = "force-dynamic";

// One-time setup endpoint, intentionally outside /api/admin so the admin
// session-cookie middleware doesn't gate it — this runs before an admin
// session can exist. Gated instead by ADMIN_PASSWORD as a bearer token.
// Every step is idempotent, so re-running this is always safe.
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

  const results: Record<string, string> = {};
  try {
    results.migration = await runMigration();
    results.coloradoDemo = await seedColoradoDemo();
    results.allStates = await seedAllStates();
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unknown error", partialResults: results },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, results });
}
