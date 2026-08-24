import { headers } from "next/headers";
import { verifyUserSessionToken } from "./user-session";
import { getUserById, type User } from "./db/users";

/** Resolves the logged-in user from the Authorization: Bearer header, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const auth = headers().get("authorization");
  const token = auth?.replace(/^Bearer\s+/i, "");
  const userId = await verifyUserSessionToken(token);
  if (!userId) return null;
  return getUserById(userId);
}
