import { NextRequest, NextResponse } from "next/server";
import { listAllStateDeadlines, createStateDeadline } from "@/lib/db/deadlines";

export const dynamic = "force-dynamic";

export async function GET() {
  const deadlines = await listAllStateDeadlines();
  return NextResponse.json({ deadlines });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const deadline = await createStateDeadline({
    state_code: body.state_code,
    title: body.title,
    description: body.description || null,
    month: Number(body.month),
    day: Number(body.day),
    category: body.category || null,
  });
  return NextResponse.json({ deadline });
}
