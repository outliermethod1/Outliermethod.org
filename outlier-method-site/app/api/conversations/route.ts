import { NextRequest, NextResponse } from "next/server";
import { listConversations } from "@/lib/db/conversations";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const stateCode = req.nextUrl.searchParams.get("state") ?? undefined;
  const conversations = await listConversations(stateCode);
  return NextResponse.json({ conversations });
}
