import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import {
  getMessageById,
  getConversation,
  getPrecedingUserMessage,
  getCitedChunkIds,
} from "@/lib/db/conversations";
import { getChunksByIds } from "@/lib/db/chunks";
import { getState } from "@/lib/db/states";
import { resolveIdentity, ownsConversation } from "@/lib/request-identity";
import { buildEligibilityMemoPdf } from "@/lib/export/pdf";

export const dynamic = "force-dynamic";

// GET so it can be opened directly (window.open / <a href>) with the bearer
// token as a ?token= fallback, same pattern as /api/export.
export async function GET(req: NextRequest, { params }: { params: { messageId: string } }) {
  const message = await getMessageById(params.messageId);
  if (!message || message.role !== "assistant") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const conversation = await getConversation(message.conversation_id);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const identity = await resolveIdentity(req);
  if (!ownsConversation(identity, conversation)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const state = await getState(conversation.state_code);
  if (!state) return NextResponse.json({ error: "State not found" }, { status: 404 });

  const [question, chunkIds] = await Promise.all([
    getPrecedingUserMessage(message),
    getCitedChunkIds(message.id),
  ]);
  const chunks = await getChunksByIds(chunkIds);
  const orderedChunks = chunkIds.map((id) => chunks.find((c) => c.id === id)).filter((c) => !!c) as typeof chunks;

  const hashInput = JSON.stringify({
    messageId: message.id,
    content: message.content,
    createdAt: message.created_at,
    chunks: orderedChunks.map((c) => ({ id: c.id, body: c.body, effective_date: c.effective_date })),
  });
  const integrityHash = createHash("sha256").update(hashInput).digest("hex");

  const pdfBytes = await buildEligibilityMemoPdf({
    question: question?.content ?? "",
    answer: message.content,
    state,
    chunks: orderedChunks,
    createdAt: message.created_at,
    integrityHash,
  });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="eligibility-memo-${message.id.slice(0, 8)}.pdf"`,
    },
  });
}
