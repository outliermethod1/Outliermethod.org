import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_PRICE_AD_ANNUAL, STRIPE_PRICE_AD_MONTHLY } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/current-user";
import { setStripeCustomerId } from "@/lib/db/users";

export const dynamic = "force-dynamic";

// AD tier only — District is invoice/PO (see /api/invoice-requests), since
// its price varies by school count and public districts mostly can't pay by
// card anyway.
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });

  const { plan } = (await req.json()) as { plan?: "annual" | "monthly" };
  const priceId = plan === "monthly" ? STRIPE_PRICE_AD_MONTHLY : STRIPE_PRICE_AD_ANNUAL;
  if (!priceId) {
    return NextResponse.json(
      { error: "Checkout isn't configured yet — STRIPE_PRICE_AD_ANNUAL/MONTHLY not set." },
      { status: 500 }
    );
  }

  try {
    const stripe = getStripe();
    const origin = req.nextUrl.origin;
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      customer: user.stripe_customer_id ?? undefined,
      customer_email: user.stripe_customer_id ? undefined : user.email,
      client_reference_id: user.id,
      metadata: { userId: user.id },
      subscription_data: { metadata: { userId: user.id } },
      success_url: `${origin}/profile?checkout=success`,
      cancel_url: `${origin}/pricing?checkout=canceled`,
    });

    // Stripe assigns a customer id at session-creation time even before
    // payment completes; save it now so a returning customer reuses it.
    if (!user.stripe_customer_id && typeof session.customer === "string") {
      await setStripeCustomerId(user.id, session.customer);
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout failed to start." },
      { status: 500 }
    );
  }
}
