import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// Public, like /api/chat itself — an anonymous visitor can attach a photo
// to their free question same as a logged-in user. Rate-limited per IP for
// abuse protection since there's no auth requirement.
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, retryAfterMs } = checkRateLimit(`upload-image:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Slow down a beat." },
      { status: 429, headers: { "Retry-After": String(Math.ceil((retryAfterMs ?? 1000) / 1000)) } }
    );
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Must be an image." }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 10MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const blob = await put(`chat-images/${crypto.randomUUID()}.${ext}`, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ ok: true, url: blob.url });
}
