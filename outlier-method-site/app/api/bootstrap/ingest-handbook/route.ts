import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/auth";
import { ingestRealHandbook } from "@/lib/setup/bootstrap";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Same auth pattern as /api/bootstrap. Ingests one state's handbook per
// call so a run across all 50 states doesn't risk one giant request timing
// out — call it once per state code.
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
    const result = await ingestRealHandbook(stateCode);
    return NextResponse.json(result);
  } catch (err) {
    console.error(`ingest-handbook failed for ${stateCode}:`, err);
    return NextResponse.json(
      { state_code: stateCode, status: "fetch_failed", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
