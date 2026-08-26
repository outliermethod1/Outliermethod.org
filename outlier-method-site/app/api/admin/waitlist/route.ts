import { NextResponse } from "next/server";
import { waitlistDemandByState } from "@/lib/db/business";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ demand: await waitlistDemandByState() });
}
