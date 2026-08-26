import Stripe from "stripe";

let client: Stripe | null = null;

/** Throws a clear message (same pattern as the other integrations) rather than
 *  crashing unhandled when STRIPE_SECRET_KEY hasn't been set yet. */
export function getStripe(): Stripe {
  if (client) return client;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set. Add it in Vercel to enable checkout.");
  client = new Stripe(key);
  return client;
}

export const STRIPE_PRICE_AD_ANNUAL = process.env.STRIPE_PRICE_AD_ANNUAL ?? "";
export const STRIPE_PRICE_AD_MONTHLY = process.env.STRIPE_PRICE_AD_MONTHLY ?? "";
export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

/** Free-tier quota: cited (Mode A) answers per rolling 30 days for a logged-in,
 *  non-paying, non-founding user. Mode B (operations) stays unlimited — the
 *  paywall is on volume of the eligibility/citation feature, never on quality. */
export const FREE_TIER_CITED_ANSWER_LIMIT = 5;
