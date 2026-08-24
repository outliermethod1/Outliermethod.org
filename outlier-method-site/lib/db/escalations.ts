import { query, queryOne } from "./client";

export interface Escalation {
  id: string;
  message_id: string;
  conversation_id: string;
  reporter_note: string | null;
  status: "open" | "resolved";
  created_at: string;
  resolved_at: string | null;
}

export async function createEscalation(
  messageId: string,
  conversationId: string,
  reporterNote: string | null
): Promise<Escalation> {
  const row = await queryOne<Escalation>(
    `insert into escalations (message_id, conversation_id, reporter_note) values ($1, $2, $3) returning *`,
    [messageId, conversationId, reporterNote]
  );
  if (!row) throw new Error("Failed to create escalation");
  return row;
}

export interface EscalationWithContext extends Escalation {
  message_content: string;
  state_code: string;
}

export async function listEscalations(): Promise<EscalationWithContext[]> {
  return query<EscalationWithContext>(
    `select e.*, m.content as message_content, c.state_code
     from escalations e
     join messages m on m.id = e.message_id
     join conversations c on c.id = e.conversation_id
     order by e.status asc, e.created_at desc`
  );
}

export async function resolveEscalation(id: string): Promise<void> {
  await query(`update escalations set status = 'resolved', resolved_at = now() where id = $1`, [id]);
}
