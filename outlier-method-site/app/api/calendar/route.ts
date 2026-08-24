import { NextRequest, NextResponse } from "next/server";
import { listStateDeadlines, listUserDeadlines, createUserDeadline } from "@/lib/db/deadlines";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const stateCode = req.nextUrl.searchParams.get("state");
  if (!stateCode) return NextResponse.json({ error: "state is required" }, { status: 400 });

  const [stateDeadlines, user] = await Promise.all([listStateDeadlines(stateCode), getCurrentUser()]);
  const userDeadlines = user ? await listUserDeadlines(user.id) : [];

  return NextResponse.json({ stateDeadlines, userDeadlines });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, description, dueDate } = (await req.json()) as {
    title?: string;
    description?: string;
    dueDate?: string;
  };
  if (!title || !dueDate) {
    return NextResponse.json({ error: "title and dueDate are required" }, { status: 400 });
  }

  const deadline = await createUserDeadline(user.id, title, description ?? null, dueDate, null);
  return NextResponse.json({ deadline });
}
