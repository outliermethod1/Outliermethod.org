import { query, queryOne } from "./client";

export interface User {
  id: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  verification_token: string | null;
  verification_expires: string | null;
  name: string | null;
  school: string | null;
  state_code: string | null;
  avatar_url: string | null;
  signature: string | null;
  created_at: string;
  updated_at: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return queryOne<User>(`select * from users where email = $1`, [email.toLowerCase().trim()]);
}

export async function getUserById(id: string): Promise<User | null> {
  return queryOne<User>(`select * from users where id = $1`, [id]);
}

export async function getUserByVerificationToken(token: string): Promise<User | null> {
  return queryOne<User>(
    `select * from users where verification_token = $1 and verification_expires > now()`,
    [token]
  );
}

export async function createUser(email: string, passwordHash: string, verificationToken: string): Promise<User> {
  const user = await queryOne<User>(
    `insert into users (email, password_hash, verification_token, verification_expires)
     values ($1, $2, $3, now() + interval '48 hours')
     returning *`,
    [email.toLowerCase().trim(), passwordHash, verificationToken]
  );
  if (!user) throw new Error("Failed to create user");
  return user;
}

export async function markEmailVerified(userId: string): Promise<void> {
  await query(
    `update users set email_verified = true, verification_token = null, verification_expires = null, updated_at = now()
     where id = $1`,
    [userId]
  );
}

export interface ProfileUpdate {
  name?: string;
  school?: string;
  state_code?: string | null;
  avatar_url?: string;
  signature?: string;
}

export async function updateProfile(userId: string, update: ProfileUpdate): Promise<User | null> {
  return queryOne<User>(
    `update users set
       name = coalesce($2, name),
       school = coalesce($3, school),
       state_code = coalesce($4, state_code),
       avatar_url = coalesce($5, avatar_url),
       signature = coalesce($6, signature),
       updated_at = now()
     where id = $1
     returning *`,
    [
      userId,
      update.name ?? null,
      update.school ?? null,
      update.state_code ?? null,
      update.avatar_url ?? null,
      update.signature ?? null,
    ]
  );
}

export async function deleteUser(userId: string): Promise<void> {
  await query(`delete from users where id = $1`, [userId]);
}

export interface UserSummary {
  id: string;
  email: string;
  email_verified: boolean;
  name: string | null;
  school: string | null;
  state_code: string | null;
  created_at: string;
}

export async function listUsers(): Promise<UserSummary[]> {
  return query<UserSummary>(
    `select id, email, email_verified, name, school, state_code, created_at
     from users order by created_at desc`
  );
}
