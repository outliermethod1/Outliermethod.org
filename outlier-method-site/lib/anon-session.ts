// Anonymous visitor session — lets a first-time visitor use Coach Eli for a
// few free questions before creating an account (see lib/anon-quota.ts for
// the actual limit enforcement). Web Crypto only, no Node built-ins, so this
// is safe to import from anywhere including Edge middleware.

export const ANON_COOKIE_NAME = "ads_anon_session";

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET;
  if (!s) throw new Error("ADMIN_SESSION_SECRET is not set.");
  return s;
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** A fresh, unsigned anonymous session id — insert this into anon_sessions before signing it into a cookie. */
export function generateAnonId(): string {
  return crypto.randomUUID();
}

export async function signAnonId(id: string): Promise<string> {
  const sig = await hmac(id);
  return `${id}.${sig}`;
}

/** Returns the anon session id if the cookie's signature checks out, else null. */
export async function verifyAnonToken(token: string | undefined | null): Promise<string | null> {
  if (!token) return null;
  const [id, sig] = token.split(".");
  if (!id || !sig) return null;
  const expected = await hmac(id);
  if (sig.length !== expected.length) return null;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0 ? id : null;
}
