// In-memory per-IP rate limiter for the chat endpoint. Scoped to a single
// serverless instance — fine for launch traffic. If this needs to hold up
// under multi-region scale, swap in Vercel KV / Upstash with the same
// interface.

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;

const hits = new Map<string, number[]>();

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs?: number } {
  const now = Date.now();
  const windowStart = now - WINDOW_MS;
  const recent = (hits.get(ip) ?? []).filter((t) => t > windowStart);

  if (recent.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = recent[0] + WINDOW_MS - now;
    return { allowed: false, retryAfterMs };
  }

  recent.push(now);
  hits.set(ip, recent);
  return { allowed: true };
}
