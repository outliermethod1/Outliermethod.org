import { NextRequest, NextResponse } from "next/server";
import { getMessageById, getConversation } from "@/lib/db/conversations";
import { resolveIdentity, ownsConversation } from "@/lib/request-identity";
import { createEscalation } from "@/lib/db/escalations";
import { sendEmail, ADMIN_NOTIFY_EMAIL } from "@/lib/email";

export const dynamic = "force-dynamic";

// One-tap escalation from the audit record — ships the real exchange to the
// admin queue instead of the user having to argue about it in the moment.
export async function POST(req: NextRequest, { params }: { params: { messageId: string } }) {
  const message = await getMessageById(params.messageId);
  if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const conversation = await getConversation(message.conversation_id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const identity = await resolveIdentity(req);
  if (!ownsConversation(identity, conversation)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { note } = (await req.json().catch(() => ({}))) as { note?: string };
  const escalation = await createEscalation(message.id, conversation.id, note?.trim() || null);

  const origin = req.nextUrl.origin;
  await sendEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: "AD Chief of Staff — exchange reported",
    html:
      `<p>A user reported an exchange for review.</p>` +
      (note ? `<p><strong>Note:</strong> ${note}</p>` : "") +
      `<p><a href="${origin}/coach/audit/${message.id}">View the permanent record</a></p>`,
  }).catch(() => {}); // best-effort — the escalation is already saved either way

  return NextResponse.json({ ok: true, escalation });
}
