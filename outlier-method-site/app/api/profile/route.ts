import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/current-user";
import { deleteUser, updateProfile } from "@/lib/db/users";
import { USER_COOKIE_NAME } from "@/lib/user-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { password_hash, verification_token, ...safe } = user;
  return NextResponse.json({ user: safe });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, school, stateCode } = (await req.json()) as {
    name?: string;
    school?: string;
    stateCode?: string;
  };
  if (name !== undefined && !name.trim()) {
    return NextResponse.json({ error: "Name can't be blank." }, { status: 400 });
  }

  const updated = await updateProfile(user.id, {
    name: name?.trim(),
    school: school?.trim(),
    state_code: stateCode || null,
  });
  const { password_hash, verification_token, ...safe } = updated!;
  return NextResponse.json({ user: safe });
}

export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteUser(user.id);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(USER_COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return res;
}
