import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { badRequest } from "@/lib/validation";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ─── Price → checkout mode map ────────────────────────────────────────────────
// Add new Price IDs here as products are created in the Stripe dashboard.
const PRICE_CONFIG: Record<string, { mode: "payment" | "subscription"; label: string }> = {
  "price_1TG5pE1P7njYP3N2t0xrbpR4": { mode: "payment",      label: "One-off access — €39" },
  "price_1TG5pb1P7njYP3N2evNHlRUL": { mode: "subscription",  label: "Architect subscription" },
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  const rateLimitResponse = checkRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const priceId: unknown = body?.priceId;
    const email: string = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const redirectToRaw: unknown = body?.redirectTo;

    if (typeof priceId !== "string" || !PRICE_CONFIG[priceId]) {
      return badRequest("Invalid or missing price ID.");
    }

    if (email && !EMAIL_REGEX.test(email)) {
      return badRequest("Please provide a valid email address.");
    }

    // Validate redirectTo: must be a relative path (starts with / but not //)
    // to prevent open-redirect attacks.
    const redirectTo =
      typeof redirectToRaw === "string" &&
      redirectToRaw.startsWith("/") &&
      !redirectToRaw.startsWith("//") &&
      redirectToRaw.length <= 300
        ? redirectToRaw
        : null;

    const { mode } = PRICE_CONFIG[priceId];

    // Use the request origin so the redirect works in both dev and production.
    const origin =
      request.headers.get("origin") ??
      process.env.NEXT_PUBLIC_SITE_URL ??
      "http://localhost:3000";

    // Build the success URL — include the post-payment redirect if provided.
    const successUrl = redirectTo
      ? `${origin}/success?session_id={CHECKOUT_SESSION_ID}&redirect=${encodeURIComponent(redirectTo)}`
      : `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;

    const session = await stripe.checkout.sessions.create({
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      // Pre-fill email if known; Stripe will still collect it otherwise.
      ...(email ? { customer_email: email } : {}),
      // Store email in metadata so the webhook can identify the Supabase user
      // even if customer_email isn't populated on the session object.
      metadata: { email },
      // Subscriptions: create a customer record in Stripe for future billing.
      ...(mode === "subscription" ? { customer_creation: "always" } : {}),
      success_url: successUrl,
      cancel_url: `${origin}/`,
    });

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL." },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("create-checkout error:", err);
    return NextResponse.json(
      { error: "Failed to create checkout session. Please try again." },
      { status: 500 }
    );
  }
}
