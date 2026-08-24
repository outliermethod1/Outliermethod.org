import { query, queryOne } from "./client";
import type { Conversation, Message } from "./types";

export interface ConversationOwner {
  userId?: string | null;
  anonSessionId?: string | null;
}

export async function createConversation(
  stateCode: string,
  title = "New conversation",
  owner: ConversationOwner = {}
): Promise<Conversation> {
  const row = await queryOne<Conversation>(
    `insert into conversations (state_code, title, user_id, anon_session_id) values ($1, $2, $3, $4) returning *`,
    [stateCode.toLowerCase(), title, owner.userId ?? null, owner.anonSessionId ?? null]
  );
  if (!row) throw new Error("Failed to create conversation");
  return row;
}

/** Conversations owned by a given user — never another user's, never an anonymous session's. */
export async function listConversations(stateCode: string | undefined, userId: string): Promise<Conversation[]> {
  if (stateCode) {
    return query<Conversation>(
      `select * from conversations where state_code = $1 and user_id = $2 order by updated_at desc`,
      [stateCode.toLowerCase(), userId]
    );
  }
  return query<Conversation>(`select * from conversations where user_id = $1 order by updated_at desc`, [userId]);
}

/** Every conversation regardless of owner — admin use only (the review/health tooling, not a tester-facing list). */
export async function listAllConversations(stateCode?: string): Promise<Conversation[]> {
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

/**
 * Reassigns an anonymous conversation to a newly-created/logged-in user,
 * once — only succeeds if the conversation is still owned by the exact
 * anon session presenting the claim (the signed cookie), so one visitor
 * can't claim another's conversation by guessing an id.
 */
export async function claimConversation(
  conversationId: string,
  anonSessionId: string,
  userId: string
): Promise<Conversation | null> {
  return queryOne<Conversation>(
    `update conversations set user_id = $3, anon_session_id = null, updated_at = now()
     where id = $1 and anon_session_id = $2
     returning *`,
    [conversationId, anonSessionId, userId]
  );
}

export async function deleteConversation(id: string): Promise<void> {
  await query(`delete from conversations where id = $1`, [id]);
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

export async function getMessageById(id: string): Promise<Message | null> {
  return queryOne<Message>(`select * from messages where id = $1`, [id]);
}

/** The user question immediately preceding a given assistant message, for audit-trail display. */
export async function getPrecedingUserMessage(assistantMessage: Message): Promise<Message | null> {
  return queryOne<Message>(
    `select * from messages
     where conversation_id = $1 and role = 'user' and created_at <= $2
     order by created_at desc
     limit 1`,
    [assistantMessage.conversation_id, assistantMessage.created_at]
  );
}

export async function getCitedChunkIds(messageId: string): Promise<string[]> {
  const row = await queryOne<{ retrieved_chunk_ids: string[] }>(
    `select retrieved_chunk_ids from chat_logs where message_id = $1`,
    [messageId]
  );
  return row?.retrieved_chunk_ids ?? [];
}
