import { NextRequest, NextResponse } from "next/server";
import { createFormTemplate, listFormTemplates, type FormLevel } from "@/lib/db/forms";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ templates: await listFormTemplates() });
}

export async function POST(req: NextRequest) {
  const { title, level, category, body } = (await req.json()) as {
    title?: string;
    level?: FormLevel;
    category?: string;
    body?: string;
  };
  if (!title || !level || !category || !body) {
    return NextResponse.json({ error: "title, level, category, and body are required" }, { status: 400 });
  }
  if (level !== "high_school" && level !== "college") {
    return NextResponse.json({ error: "level must be 'high_school' or 'college'" }, { status: 400 });
  }
  const template = await createFormTemplate({ title, level, category, body });
  return NextResponse.json({ ok: true, template });
}
