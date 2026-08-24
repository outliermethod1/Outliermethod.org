import { query, queryOne } from "./client";

export interface StateDeadline {
  id: string;
  state_code: string;
  title: string;
  description: string | null;
  month: number;
  day: number;
  category: string | null;
}

export async function listStateDeadlines(stateCode: string): Promise<StateDeadline[]> {
  return query<StateDeadline>(
    `select id, state_code, title, description, month, day, category from state_deadlines
     where state_code = $1 order by month, day`,
    [stateCode.toLowerCase()]
  );
}

export async function listAllStateDeadlines(): Promise<StateDeadline[]> {
  return query<StateDeadline>(
    `select id, state_code, title, description, month, day, category from state_deadlines
     order by state_code, month, day`
  );
}

export async function createStateDeadline(d: Omit<StateDeadline, "id">): Promise<StateDeadline> {
  const row = await queryOne<StateDeadline>(
    `insert into state_deadlines (state_code, title, description, month, day, category)
     values ($1,$2,$3,$4,$5,$6) returning id, state_code, title, description, month, day, category`,
    [d.state_code.toLowerCase(), d.title, d.description, d.month, d.day, d.category]
  );
  if (!row) throw new Error("Failed to create state deadline");
  return row;
}

export async function deleteStateDeadline(id: string): Promise<void> {
  await query(`delete from state_deadlines where id = $1`, [id]);
}

export interface UserDeadline {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string;
  source_message_id: string | null;
  created_at: string;
}

export async function listUserDeadlines(userId: string): Promise<UserDeadline[]> {
  return query<UserDeadline>(
    `select * from user_deadlines where user_id = $1 order by due_date`,
    [userId]
  );
}

export async function createUserDeadline(
  userId: string,
  title: string,
  description: string | null,
  dueDate: string,
  sourceMessageId: string | null
): Promise<UserDeadline> {
  const row = await queryOne<UserDeadline>(
    `insert into user_deadlines (user_id, title, description, due_date, source_message_id)
     values ($1,$2,$3,$4,$5) returning *`,
    [userId, title, description, dueDate, sourceMessageId]
  );
  if (!row) throw new Error("Failed to create user deadline");
  return row;
}

export async function deleteUserDeadline(id: string, userId: string): Promise<void> {
  await query(`delete from user_deadlines where id = $1 and user_id = $2`, [id, userId]);
}
