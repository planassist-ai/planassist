import { Suspense } from "react";
import Link from "next/link";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Use service role key to bypass RLS.
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}

async function confirmPayment(sessionId: string): Promise<{ email: string | null; error?: string }> {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  let session: Stripe.Checkout.Session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return { email: null, error: "Could not retrieve payment session." };
  }

  if (session.payment_status !== "paid" && session.status !== "complete") {
    return { email: null, error: "Payment not yet confirmed." };
  }

  const email =
    session.customer_email ??
    (session.metadata?.email as string | undefined) ??
    null;

  if (!email) {
    // Payment confirmed but no email — webhook will handle DB update.
    return { email: null };
  }

  // Belt-and-suspenders: also update here in case webhook hasn't fired yet.
  const supabase = getSupabaseAdmin();
  await supabase
    .from("profiles")
    .update({ is_paid: true })
    .eq("email", email);

  return { email };
}

async function SuccessContent({ sessionId }: { sessionId: string }) {
  const { email, error } = await confirmPayment(sessionId);

  if (error) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Payment verification pending</h1>
        <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
          {error} Your access will be activated automatically. If it doesn&apos;t appear within a few minutes, please contact us.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-colors"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      {/* Success icon */}
      <div className="w-16 h-16 rounded-2xl bg-green-100 border border-green-200 flex items-center justify-center mx-auto mb-5">
        <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
        You&apos;re all set!
      </h1>

      {email && (
        <p className="text-sm text-gray-500 mb-2">
          Access activated for <span className="font-medium text-gray-700">{email}</span>
        </p>
      )}

      <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
        Your account has full access to all Planr features. Sign in to get started.
      </p>

      {/* Feature highlights */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 mb-7 text-left">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Now unlocked</p>
        <ul className="space-y-2.5">
          {[
            "Document interpreter — RFIs, conditions, appeals decoded",
            "Application status tracking in plain English",
            "Full county intelligence for all 26 counties",
            "Application monitoring with email alerts",
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-4 h-4 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <svg className="w-2.5 h-2.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span className="text-sm text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-3.5 px-8 rounded-xl text-sm transition-colors"
      >
        Go to dashboard
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </Link>
    </div>
  );
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
        {sessionId ? (
          <Suspense fallback={
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-gray-500">Confirming your payment…</p>
            </div>
          }>
            <SuccessContent sessionId={sessionId} />
          </Suspense>
        ) : (
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid link</h1>
            <p className="text-sm text-gray-500 mb-6">No session ID found. If you completed a payment, check your email for confirmation.</p>
            <Link href="/" className="text-sm text-green-600 hover:text-green-700 underline underline-offset-2">
              Back to home
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
