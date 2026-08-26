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
  reset_token: string | null;
  reset_expires: string | null;
  voice_enabled: boolean;
  stripe_customer_id: string | null;
  subscription_status: "free" | "active" | "past_due" | "canceled";
  subscription_tier: "ad" | "district" | null;
  is_founding_member: boolean;
  founding_code_used: string | null;
  cited_answer_count: number;
  cited_answer_count_reset_at: string;
  created_at: string;
  updated_at: string;
}

/** True if this account can answer without hitting the free-tier volume cap. */
export function isPaidOrFounding(user: User): boolean {
  return user.is_founding_member || user.subscription_status === "active";
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

export async function createUser(
  email: string,
  passwordHash: string,
  verificationToken: string,
  foundingCode?: string
): Promise<User> {
  const user = await queryOne<User>(
    `insert into users (email, password_hash, verification_token, verification_expires, is_founding_member, founding_code_used)
     values ($1, $2, $3, now() + interval '48 hours', $4, $5)
     returning *`,
    [email.toLowerCase().trim(), passwordHash, verificationToken, !!foundingCode, foundingCode ?? null]
  );
  if (!user) throw new Error("Failed to create user");
  return user;
}

/** Atomically redeems a founding code if it still has uses left. Returns false if invalid/exhausted. */
export async function redeemFoundingCode(code: string): Promise<boolean> {
  const result = await query<{ code: string }>(
    `update founding_codes set used_count = used_count + 1
     where code = $1 and used_count < max_uses
     returning code`,
    [code.trim()]
  );
  return result.length > 0;
}

/** Increments the monthly cited-answer counter, resetting it first if a month has passed.
 *  Returns the count AFTER this increment, for the caller to compare against the free limit. */
export async function incrementCitedAnswerCount(userId: string): Promise<number> {
  const row = await queryOne<{ cited_answer_count: number }>(
    `update users set
       cited_answer_count = case
         when cited_answer_count_reset_at < now() - interval '30 days' then 1
         else cited_answer_count + 1
       end,
       cited_answer_count_reset_at = case
         when cited_answer_count_reset_at < now() - interval '30 days' then now()
         else cited_answer_count_reset_at
       end,
       updated_at = now()
     where id = $1
     returning cited_answer_count`,
    [userId]
  );
  return row?.cited_answer_count ?? 0;
}

export async function markEmailVerified(userId: string): Promise<void> {
  await query(
    `update users set email_verified = true, verification_token = null, verification_expires = null, updated_at = now()
     where id = $1`,
    [userId]
  );
}

export async function setResetToken(userId: string, token: string): Promise<void> {
  await query(
    `update users set reset_token = $2, reset_expires = now() + interval '1 hour', updated_at = now()
     where id = $1`,
    [userId, token]
  );
}

export async function getUserByResetToken(token: string): Promise<User | null> {
  return queryOne<User>(`select * from users where reset_token = $1 and reset_expires > now()`, [token]);
}

export async function resetPassword(userId: string, passwordHash: string): Promise<void> {
  await query(
    `update users set password_hash = $2, reset_token = null, reset_expires = null, updated_at = now()
     where id = $1`,
    [userId, passwordHash]
  );
}

export interface ProfileUpdate {
  name?: string;
  school?: string;
  state_code?: string | null;
  avatar_url?: string;
  signature?: string;
  voice_enabled?: boolean;
}

export async function updateProfile(userId: string, update: ProfileUpdate): Promise<User | null> {
  return queryOne<User>(
    `update users set
       name = coalesce($2, name),
       school = coalesce($3, school),
       state_code = coalesce($4, state_code),
       avatar_url = coalesce($5, avatar_url),
       signature = coalesce($6, signature),
       voice_enabled = coalesce($7, voice_enabled),
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
      update.voice_enabled ?? null,
    ]
  );
}

export async function deleteUser(userId: string): Promise<void> {
  await query(`delete from users where id = $1`, [userId]);
}

export async function getUserByStripeCustomerId(customerId: string): Promise<User | null> {
  return queryOne<User>(`select * from users where stripe_customer_id = $1`, [customerId]);
}

export async function setStripeCustomerId(userId: string, customerId: string): Promise<void> {
  await query(`update users set stripe_customer_id = $2, updated_at = now() where id = $1`, [userId, customerId]);
}

export async function setSubscriptionStatus(
  userId: string,
  status: User["subscription_status"],
  tier: User["subscription_tier"]
): Promise<void> {
  await query(
    `update users set subscription_status = $2, subscription_tier = $3, updated_at = now() where id = $1`,
    [userId, status, tier]
  );
}

export interface UserSummary {
  id: string;
  email: string;
  email_verified: boolean;
  name: string | null;
  school: string | null;
  state_code: string | null;
  subscription_status: string;
  subscription_tier: string | null;
  is_founding_member: boolean;
  created_at: string;
}

export async function listUsers(): Promise<UserSummary[]> {
  return query<UserSummary>(
    `select id, email, email_verified, name, school, state_code,
            subscription_status, subscription_tier, is_founding_member, created_at
     from users order by created_at desc`
  );
}
