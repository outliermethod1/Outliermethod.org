import { NextResponse } from "next/server";
import { listEscalations } from "@/lib/db/escalations";

export const dynamic = "force-dynamic";

export async function GET() {
  const escalations = await listEscalations();
  return NextResponse.json({ escalations });
}
