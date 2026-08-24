import { NextRequest, NextResponse } from "next/server";
import { deleteFormTemplate, updateFormTemplate, type FormLevel } from "@/lib/db/forms";

export const dynamic = "force-dynamic";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { title, level, category, body } = (await req.json()) as {
    title?: string;
    level?: FormLevel;
    category?: string;
    body?: string;
  };
  if (!title || !level || !category || !body) {
    return NextResponse.json({ error: "title, level, category, and body are required" }, { status: 400 });
  }
  const template = await updateFormTemplate(params.id, { title, level, category, body });
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, template });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await deleteFormTemplate(params.id);
  return NextResponse.json({ ok: true });
}
