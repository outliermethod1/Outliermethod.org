import { NextResponse } from "next/server";
import { listReviewQueue } from "@/lib/db/review-queue";

export const dynamic = "force-dynamic";

export async function GET() {
  const pending = await listReviewQueue("pending");
  return NextResponse.json({ items: pending });
}
