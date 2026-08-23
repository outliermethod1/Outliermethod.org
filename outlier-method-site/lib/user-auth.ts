// Password hashing — Node's crypto (scrypt). Node-runtime only: never
// imported by middleware.ts (Edge runtime, no Node built-ins). Session token
// functions live in lib/user-session.ts instead, which middleware imports.

import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const storedBuf = Buffer.from(hashHex, "hex");
  if (derived.length !== storedBuf.length) return false;
  return timingSafeEqual(derived, storedBuf);
}

export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

export { createUserSessionToken, verifyUserSessionToken, USER_COOKIE_NAME } from "./user-session";
