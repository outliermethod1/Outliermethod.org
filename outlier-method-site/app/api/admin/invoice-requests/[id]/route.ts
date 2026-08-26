import { NextRequest, NextResponse } from "next/server";
import { setInvoiceRequestStatus, type InvoiceRequest } from "@/lib/db/business";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const { status } = (await req.json()) as { status: InvoiceRequest["status"] };
  await setInvoiceRequestStatus(params.id, status);
  return NextResponse.json({ ok: true });
}
