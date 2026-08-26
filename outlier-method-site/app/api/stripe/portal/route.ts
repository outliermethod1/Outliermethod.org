import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getCurrentUser } from "@/lib/current-user";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Log in first." }, { status: 401 });
  if (!user.stripe_customer_id) {
    return NextResponse.json({ error: "No subscription on file yet." }, { status: 400 });
  }

  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${req.nextUrl.origin}/profile`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Couldn't open billing portal." },
      { status: 500 }
    );
  }
}
