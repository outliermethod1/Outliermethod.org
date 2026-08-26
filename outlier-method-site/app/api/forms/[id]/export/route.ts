import { NextRequest, NextResponse } from "next/server";
import { getFormTemplate } from "@/lib/db/forms";
import { buildFormPdf, buildFormDocx } from "@/lib/export/forms";
import { resolveIdentity } from "@/lib/request-identity";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

// A logged-in AD gets their school name and signature filled in; an
// anonymous visitor still gets a clean, ready-to-send document with
// placeholders — the paywall is on volume/history, not on this.
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const template = await getFormTemplate(params.id);
  if (!template) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const format = req.nextUrl.searchParams.get("format") === "docx" ? "docx" : "pdf";

  const identity = await resolveIdentity(req);
  const user = identity.userId ? await getCurrentUser() : null;

  const ctx = {
    title: template.title,
    body: template.body,
    schoolName: user?.school ?? null,
    signature: user?.signature ?? null,
  };

  if (format === "docx") {
    const buffer = await buildFormDocx(ctx);
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${slugify(template.title)}.docx"`,
      },
    });
  }

  const pdfBytes = await buildFormPdf(ctx);
  return new NextResponse(Buffer.from(pdfBytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${slugify(template.title)}.pdf"`,
    },
  });
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
