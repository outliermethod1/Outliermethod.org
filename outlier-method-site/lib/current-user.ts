import { cookies } from "next/headers";
import { USER_COOKIE_NAME, verifyUserSessionToken } from "./user-auth";
import { getUserById, type User } from "./db/users";

/** Resolves the logged-in user from the session cookie, or null. For use in Node-runtime route handlers. */
export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get(USER_COOKIE_NAME)?.value;
  const userId = await verifyUserSessionToken(token);
  if (!userId) return null;
  return getUserById(userId);
}
