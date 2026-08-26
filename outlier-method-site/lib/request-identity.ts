import { NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "./auth";
import { verifyUserSessionToken } from "./user-session";
import { verifyAnonToken, ANON_COOKIE_NAME } from "./anon-session";

export interface RequestIdentity {
  userId: string | null;
  isAdmin: boolean;
  anonSessionId: string | null;
}

/** Resolves who's making this request: a beta-tester user, admin, or (if
 * neither) whatever anonymous session cookie they're carrying, if any. */
export async function resolveIdentity(req: NextRequest): Promise<RequestIdentity> {
  const auth = req.headers.get("authorization");
  // window.open / <a href> navigations can't attach a custom header, so a
  // ?token= query param is accepted as a fallback wherever a link needs to
  // carry auth (memo/PDF export, audit permalinks opened in a new tab).
  const bearerToken = auth?.replace(/^Bearer\s+/i, "") || req.nextUrl.searchParams.get("token") || undefined;
  const userId = await verifyUserSessionToken(bearerToken);

  const adminToken = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAdmin = await verifySessionToken(adminToken);

  const anonToken = req.cookies.get(ANON_COOKIE_NAME)?.value;
  const anonSessionId = await verifyAnonToken(anonToken);

  return { userId, isAdmin, anonSessionId };
}

/** Does this identity have permission to see the given conversation? */
export function ownsConversation(
  identity: RequestIdentity,
  conversation: { user_id: string | null; anon_session_id: string | null }
): boolean {
  if (identity.isAdmin) return true;
  if (identity.userId && conversation.user_id === identity.userId) return true;
  if (identity.anonSessionId && conversation.anon_session_id === identity.anonSessionId) return true;
  return false;
}
