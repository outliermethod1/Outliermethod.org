import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { getUserByStripeCustomerId, setSubscriptionStatus, setStripeCustomerId } from "@/lib/db/users";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not set." }, { status: 500 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  if (!signature) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId ?? session.client_reference_id;
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id;
        if (userId && customerId) {
          await setStripeCustomerId(userId, customerId);
          await setSubscriptionStatus(userId, "active", "ad");
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const user = await getUserByStripeCustomerId(customerId);
        if (user) {
          const status = sub.status === "active" || sub.status === "trialing" ? "active" : "past_due";
          await setSubscriptionStatus(user.id, status, "ad");
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
        const user = await getUserByStripeCustomerId(customerId);
        if (user) await setSubscriptionStatus(user.id, "canceled", null);
        break;
      }
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === "string" ? invoice.customer : invoice.customer?.id;
        if (customerId) {
          const user = await getUserByStripeCustomerId(customerId);
          if (user) await setSubscriptionStatus(user.id, "past_due", user.subscription_tier);
        }
        break;
      }
    }
  } catch (err) {
    console.error(`Stripe webhook handler failed for ${event.type}:`, err);
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
