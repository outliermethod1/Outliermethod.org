// Free-question quota for anonymous /coach visitors. The cookie-tracked
// per-session count is authoritative — that's genuinely "how many has this
// visitor asked." The per-IP counter is a soft backstop only: schools NAT
// large numbers of legitimate users behind one address, so a busy IP must
// never lock out a brand-new visitor on its own. It only kicks in once an
// IP's aggregate usage is far past what one person's 3-question budget
// would produce, to catch someone repeatedly clearing cookies to "reset."
export const FREE_QUESTION_LIMIT = 3;
const IP_ABUSE_THRESHOLD = FREE_QUESTION_LIMIT * 10;

/**
 * How many free questions this visitor has effectively used, accounting for
 * the IP backstop. Only ever raises a *brand-new* session's count (from 0)
 * up to the limit — never lowers or blocks an in-progress session, and
 * never blocks based on IP alone for a session already in use.
 */
export function effectiveExchangeCount(sessionCount: number, ipUsageCount: number): number {
  if (sessionCount === 0 && ipUsageCount >= IP_ABUSE_THRESHOLD) {
    return FREE_QUESTION_LIMIT;
  }
  return sessionCount;
}

export function remainingFreeQuestions(sessionCount: number, ipUsageCount: number): number {
  return Math.max(0, FREE_QUESTION_LIMIT - effectiveExchangeCount(sessionCount, ipUsageCount));
}

export async function hashIp(ip: string): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET ?? "";
  const data = new TextEncoder().encode(`${ip}:${secret}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
