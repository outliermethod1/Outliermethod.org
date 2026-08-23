import { NextRequest, NextResponse } from "next/server";
import { getConversation, listMessages } from "@/lib/db/conversations";
import { getState } from "@/lib/db/states";
import { query } from "@/lib/db/client";
import { getChunksByIds } from "@/lib/db/chunks";
import { buildConversationPdf } from "@/lib/export/pdf";
import type { BylawChunk } from "@/lib/db/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const conversationId = req.nextUrl.searchParams.get("conversationId");
  if (!conversationId) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  const conversation = await getConversation(conversationId);
  if (!conversation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [messages, state] = await Promise.all([listMessages(conversationId), getState(conversation.state_code)]);
  if (!state) return NextResponse.json({ error: "State not configured" }, { status: 500 });

  const chatLogs = await query<{ message_id: string; retrieved_chunk_ids: string[] }>(
    `select message_id, retrieved_chunk_ids from chat_logs where message_id = any($1)`,
    [messages.map((m) => m.id)]
  );

  const allChunkIds = Array.from(new Set(chatLogs.flatMap((l) => l.retrieved_chunk_ids)));
  const chunks = await getChunksByIds(allChunkIds);
  const chunkById = new Map(chunks.map((c) => [c.id, c]));

  const chunksByMessageId = new Map<string, BylawChunk[]>();
  for (const log of chatLogs) {
    chunksByMessageId.set(
      log.message_id,
      log.retrieved_chunk_ids.map((id) => chunkById.get(id)).filter((c): c is BylawChunk => !!c)
    );
  }

  const pdfBytes = await buildConversationPdf({ conversation, messages, state, chunksByMessageId });

  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ad-chief-of-staff-${conversationId}.pdf"`,
    },
  });
}
