import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { claimConversation } from "@/lib/db/conversations";
import { verifyAnonToken, ANON_COOKIE_NAME } from "@/lib/anon-session";

export const dynamic = "force-dynamic";

// Called right after signup/login when the visitor arrived from the
// anonymous-quota gate — reassigns their pre-account conversation to the
// new user id so nothing they already asked (or Eli already answered) is
// lost. Only succeeds if the anon session cookie still presented actually
// owns that conversation, so this can't be used to grab someone else's.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const anonToken = req.cookies.get(ANON_COOKIE_NAME)?.value;
  const anonSessionId = await verifyAnonToken(anonToken);
  if (!anonSessionId) {
    return NextResponse.json({ error: "No anonymous session to claim from" }, { status: 400 });
  }

  const { conversationId } = (await req.json()) as { conversationId?: string };
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  const claimed = await claimConversation(conversationId, anonSessionId, user.id);
  if (!claimed) {
    return NextResponse.json({ error: "Nothing to claim — already claimed or not yours." }, { status: 404 });
  }
  return NextResponse.json({ ok: true, conversation: claimed });
}
