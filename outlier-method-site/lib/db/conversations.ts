import { query, queryOne } from "./client";
import type { Conversation, Message } from "./types";

export async function createConversation(stateCode: string, title = "New conversation"): Promise<Conversation> {
  const row = await queryOne<Conversation>(
    `insert into conversations (state_code, title) values ($1, $2) returning *`,
    [stateCode.toLowerCase(), title]
  );
  if (!row) throw new Error("Failed to create conversation");
  return row;
}

export async function listConversations(stateCode?: string): Promise<Conversation[]> {
  if (stateCode) {
    return query<Conversation>(
      `select * from conversations where state_code = $1 order by updated_at desc`,
      [stateCode.toLowerCase()]
    );
  }
  return query<Conversation>(`select * from conversations order by updated_at desc`);
}

export async function getConversation(id: string): Promise<Conversation | null> {
  return queryOne<Conversation>(`select * from conversations where id = $1`, [id]);
}

export async function touchConversation(id: string, title?: string): Promise<void> {
  if (title) {
    await query(`update conversations set updated_at = now(), title = $2 where id = $1`, [id, title]);
  } else {
    await query(`update conversations set updated_at = now() where id = $1`, [id]);
  }
}

export async function listMessages(conversationId: string): Promise<Message[]> {
  return query<Message>(`select * from messages where conversation_id = $1 order by created_at asc`, [
    conversationId,
  ]);
}

export async function addMessage(
  conversationId: string,
  role: "user" | "assistant",
  content: string,
  mode: "A" | "B" | "mixed" | null = null
): Promise<Message> {
  const row = await queryOne<Message>(
    `insert into messages (conversation_id, role, content, mode) values ($1, $2, $3, $4) returning *`,
    [conversationId, role, content, mode]
  );
  if (!row) throw new Error("Failed to add message");
  return row;
}

export async function logChatChunks(messageId: string, chunkIds: string[]): Promise<void> {
  await query(`insert into chat_logs (message_id, retrieved_chunk_ids) values ($1, $2)`, [
    messageId,
    chunkIds,
  ]);
}
