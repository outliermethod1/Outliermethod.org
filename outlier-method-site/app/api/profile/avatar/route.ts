import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { getCurrentUser } from "@/lib/current-user";
import { updateProfile } from "@/lib/db/users";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });
  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Must be an image." }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "Image must be under 5MB." }, { status: 400 });
  }

  const ext = file.name.split(".").pop() || "jpg";
  const blob = await put(`avatars/${user.id}.${ext}`, file, { access: "public", addRandomSuffix: true });

  const updated = await updateProfile(user.id, { avatar_url: blob.url });
  return NextResponse.json({ ok: true, avatarUrl: updated?.avatar_url });
}
