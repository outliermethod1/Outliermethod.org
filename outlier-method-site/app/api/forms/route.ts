import { NextResponse } from "next/server";
import { listFormTemplates } from "@/lib/db/forms";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ templates: await listFormTemplates() });
}
