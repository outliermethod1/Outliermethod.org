import { NextResponse } from "next/server";
import { listStates } from "@/lib/db/states";

export const dynamic = "force-dynamic";

export async function GET() {
  const states = await listStates();
  return NextResponse.json({ states });
}
