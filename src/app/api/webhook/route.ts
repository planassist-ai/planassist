import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Architect subscription price ID — keep in sync with create-checkout/route.ts
const ARCHITECT_PRICE_ID = "price_1TG5pb1P7njYP3N2evNHlRUL";

// Use service role key to bypass RLS when updating payment status.
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json({ error: "Missing signature or webhook secret." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const email =
          session.customer_email ??
          (session.metadata?.email as string | undefined) ??
          null;

        if (!email) {
          console.warn("checkout.session.completed — no email found, skipping update", session.id);
          break;
        }

        // Determine if this is an architect subscription or a one-off homeowner payment.
        let isArchitect = false;
        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          const priceId = lineItems.data[0]?.price?.id ?? null;
          isArchitect = priceId === ARCHITECT_PRICE_ID;
        } catch (err) {
          console.warn("Could not retrieve line items for session", session.id, err);
        }

        const { error } = await supabase
          .from("profiles")
          .update({ is_paid: true, ...(isArchitect ? { is_architect: true } : {}) })
          .eq("email", email);

        if (error) {
          console.error("Supabase update failed for checkout.session.completed:", error);
          return NextResponse.json({ error: "DB update failed." }, { status: 500 });
        }

        console.log(`Payment confirmed — is_paid=true${isArchitect ? ", is_architect=true" : ""} for`, email);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(subscription.customer as string);

        if (customer.deleted) {
          console.warn("customer.subscription.deleted — customer already deleted", subscription.id);
          break;
        }

        const email = (customer as Stripe.Customer).email;
        if (!email) {
          console.warn("customer.subscription.deleted — no email on customer", subscription.id);
          break;
        }

        const { error } = await supabase
          .from("profiles")
          .update({ is_paid: false, is_architect: false })
          .eq("email", email);

        if (error) {
          console.error("Supabase update failed for customer.subscription.deleted:", error);
          return NextResponse.json({ error: "DB update failed." }, { status: 500 });
        }

        console.log("Subscription cancelled — is_paid=false, is_architect=false for", email);
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
