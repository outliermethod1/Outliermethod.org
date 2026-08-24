import { NextResponse } from "next/server";

// No-op — the beta-tester session lives in the client's sessionStorage
// (lib/auth-client.ts), not a cookie, so there's nothing server-side to
// clear. Kept as an endpoint for symmetry / in case a future auth mode needs it.
export async function POST() {
  return NextResponse.json({ ok: true });
}
