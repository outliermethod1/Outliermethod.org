import { NextResponse } from "next/server";
import { listInvoiceRequests } from "@/lib/db/business";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ requests: await listInvoiceRequests() });
}
