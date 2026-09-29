import { NextRequest, NextResponse } from "next/server";
import { checkAdminPassword } from "@/lib/auth";
import { deleteChunkById, getChunkById } from "@/lib/db/chunks";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const chunk = await getChunkById(params.id);
  if (!chunk) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ chunk });
}

// Same bearer-token admin pattern as /api/bootstrap/* — this route isn't
// under /api/admin/:path* in middleware's matcher, so it checks itself.
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
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

  const deleted = await deleteChunkById(params.id);
  if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
