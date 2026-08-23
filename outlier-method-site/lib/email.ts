// Transactional email via Resend's REST API — no SDK dependency, just a
// fetch call. Requires RESEND_API_KEY. Sending to arbitrary recipients (not
// just the Resend account owner) requires a verified sending domain in the
// Resend dashboard; until one is verified, Resend's sandbox only delivers to
// the account's own email, so beta-tester verification emails won't reach
// real ADs until that's set up.

const FROM = process.env.EMAIL_FROM || "AD Chief of Staff <onboarding@resend.dev>";
export const ADMIN_NOTIFY_EMAIL = process.env.ADMIN_NOTIFY_EMAIL || "outliermethod1@gmail.com";

export async function sendEmail(opts: { to: string; subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`RESEND_API_KEY not set — email not sent. Would have sent "${opts.subject}" to ${opts.to}.`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`Resend send failed (${res.status}): ${body}`);
  }
}
