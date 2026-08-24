import { NextRequest, NextResponse } from "next/server";
import { listConversations, listAllConversations } from "@/lib/db/conversations";
import { resolveIdentity } from "@/lib/request-identity";

export const dynamic = "force-dynamic";

// Saved conversation history (this left-rail list, across sessions) is an
// account feature — an anonymous visitor's single in-progress conversation
// doesn't show up here, only what a logged-in user or admin owns.
export async function GET(req: NextRequest) {
  const stateCode = req.nextUrl.searchParams.get("state") ?? undefined;
  const identity = await resolveIdentity(req);

  if (identity.isAdmin) {
    const conversations = await listAllConversations(stateCode);
    return NextResponse.json({ conversations });
  }
  if (!identity.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const conversations = await listConversations(stateCode, identity.userId);
  return NextResponse.json({ conversations });
}
