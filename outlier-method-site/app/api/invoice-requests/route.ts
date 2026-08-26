import { NextRequest, NextResponse } from "next/server";
import { createInvoiceRequest } from "@/lib/db/business";
import { sendEmail, ADMIN_NOTIFY_EMAIL } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed } = checkRateLimit(`invoice-request:${ip}`);
  if (!allowed) return NextResponse.json({ error: "Too many attempts. Try again shortly." }, { status: 429 });

  const body = (await req.json()) as {
    schoolOrDistrict?: string;
    contactName?: string;
    contactEmail?: string;
    tier?: "ad" | "district";
    schoolCount?: number;
    note?: string;
  };
  if (!body.schoolOrDistrict || !body.contactName || !body.contactEmail || !body.tier) {
    return NextResponse.json({ error: "School/district, contact name, email, and tier are required." }, { status: 400 });
  }

  const request = await createInvoiceRequest({
    schoolOrDistrict: body.schoolOrDistrict,
    contactName: body.contactName,
    contactEmail: body.contactEmail,
    tier: body.tier,
    schoolCount: body.schoolCount ?? null,
    note: body.note ?? null,
  });

  await sendEmail({
    to: ADMIN_NOTIFY_EMAIL,
    subject: `Invoice/PO request — ${body.schoolOrDistrict}`,
    html: `<p>New invoice request (${body.tier} tier):</p>
      <p><strong>${body.schoolOrDistrict}</strong><br>
      Contact: ${body.contactName} — ${body.contactEmail}<br>
      ${body.schoolCount ? `School count: ${body.schoolCount}<br>` : ""}
      ${body.note ? `Note: ${body.note}` : ""}</p>
      <p>View in /admin/invoice-requests.</p>`,
  });

  return NextResponse.json({ ok: true, id: request.id });
}
