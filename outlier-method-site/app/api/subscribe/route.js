import { NextResponse } from "next/server";

/* ============================================================
   NEWSLETTER SIGNUP — The Campfire Weekly.
   Subscribes an email via Buttondown. Set BUTTONDOWN_API_KEY in
   Vercel → Project → Settings → Environment Variables.
   Never hardcode the key.
============================================================ */

const FRIENDLY_ERROR = "Something went wrong on our end — give it another try in a minute.";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  const { email } = await request.json();

  if (!email || typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json(
      { ok: false, message: "That doesn't look like an email address — check it and try again." },
      { status: 400 }
    );
  }

  if (!process.env.BUTTONDOWN_API_KEY) {
    console.error("subscribe: BUTTONDOWN_API_KEY is not set");
    return NextResponse.json({ ok: false, message: FRIENDLY_ERROR }, { status: 500 });
  }

  try {
    const res = await fetch("https://api.buttondown.com/v1/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
      },
      body: JSON.stringify({ email_address: email.trim() }),
    });

    if (res.ok) {
      return NextResponse.json({ ok: true });
    }

    const body = await res.text();
    // Buttondown rejects duplicates with an error mentioning the address
    // already exists — treat that as success.
    if (body.toLowerCase().includes("already")) {
      return NextResponse.json({ ok: true, already: true });
    }

    console.error("Buttondown API error", res.status, body);
    return NextResponse.json({ ok: false, message: FRIENDLY_ERROR }, { status: 502 });
  } catch (err) {
    console.error("Buttondown API error", err);
    return NextResponse.json({ ok: false, message: FRIENDLY_ERROR }, { status: 502 });
  }
}
