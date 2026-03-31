"use client";

import { useState } from "react";
import Link from "next/link";

// Price IDs — keep in sync with src/app/api/create-checkout/route.ts
const PRICE_ONE_OFF      = "price_1TG5pE1P7njYP3N2t0xrbpR4";
const PRICE_SUBSCRIPTION = "price_1TG5pb1P7njYP3N2evNHlRUL";

interface UpgradePromptProps {
  feature: string;
  description: string;
  /** "paid" (default) = homeowner/any subscription. "architect" = architect subscription only. */
  tier?: "paid" | "architect";
}

const PAID_FEATURES = [
  "Full county intelligence — all policies, warnings, and document links",
  "Application status tracking with plain-English explanations",
  "Document interpreter — RFIs, conditions, appeals decoded instantly",
  "Application monitoring with email alerts on status changes",
  "Newspaper notice generator with statutory wording templates",
  "Design guide checker — AI analysis against county design guidelines",
  "Planning statement generator — professional draft in minutes",
  "Full grants checker with conditions and application links",
  "Self-build tracker — milestones, checklists, bank drawdown documents",
];

const ARCHITECT_FEATURES = [
  "Architect dashboard with full pipeline management",
  "Client portal with document upload and sharing",
  "Deadline alerts and statutory calendar management",
  "RFI assistant — plain-English breakdown with prioritised actions",
  "Pre-submission validator — catch issues before lodging",
  "Notice generator with statutory wording templates",
  "Client update notifications and communication tools",
];

async function startCheckout(priceId: string): Promise<void> {
  const res = await fetch("/api/create-checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ priceId }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error ?? "Failed to start checkout.");
  }

  const { url } = await res.json() as { url: string };
  window.location.href = url;
}

export function UpgradePrompt({ feature, description, tier = "paid" }: UpgradePromptProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  async function handleCheckout(priceId: string) {
    setLoading(priceId);
    setCheckoutError(null);
    try {
      await startCheckout(priceId);
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setLoading(null);
    }
  }

  const isArchitectTier = tier === "architect";
  const features = isArchitectTier ? ARCHITECT_FEATURES : PAID_FEATURES;

  return (
    <div className="px-4 py-10 sm:px-6 sm:py-14 max-w-2xl mx-auto">

      {/* Lock icon */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      </div>

      {/* Heading */}
      <div className="text-center mb-7">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
          {feature}
        </h2>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
          {description}
        </p>
      </div>

      {/* Feature list */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
          {isArchitectTier
            ? "Everything included with Architect subscription"
            : "Everything included — €39 per application, one-off"}
        </p>
        <ul className="space-y-3">
          {features.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </span>
              <span className="text-sm text-gray-700 leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Error */}
      {checkoutError && (
        <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {checkoutError}
        </div>
      )}

      {/* Price + CTA */}
      <div className="text-center space-y-3">
        {isArchitectTier ? (
          <>
            <button
              onClick={() => handleCheckout(PRICE_SUBSCRIPTION)}
              disabled={loading !== null}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-colors text-sm"
            >
              {loading === PRICE_SUBSCRIPTION ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirecting to checkout…
                </>
              ) : (
                "Subscribe as Architect — 60-day free trial"
              )}
            </button>
            <p className="text-xs text-gray-400 pt-1">
              Already subscribed?{" "}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 underline underline-offset-2 transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </>
        ) : (
          <>
            <button
              onClick={() => handleCheckout(PRICE_ONE_OFF)}
              disabled={loading !== null}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-xl transition-colors text-sm"
            >
              {loading === PRICE_ONE_OFF ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Redirecting to checkout…
                </>
              ) : (
                "Get access — €39 per application"
              )}
            </button>

            <p className="text-xs text-gray-500">
              One-off payment — covers this application from submission to final decision. Not a subscription.
            </p>

            <p className="text-xs text-gray-400">
              Or{" "}
              <button
                onClick={() => handleCheckout(PRICE_SUBSCRIPTION)}
                disabled={loading !== null}
                className="underline underline-offset-2 hover:text-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading === PRICE_SUBSCRIPTION ? "Redirecting…" : "subscribe as an Architect"}
              </button>
              {" "}(60-day free trial)
            </p>

            <p className="text-xs text-gray-400 pt-1">
              Already have access?{" "}
              <Link
                href="/login"
                className="text-green-600 hover:text-green-700 underline underline-offset-2 transition-colors font-medium"
              >
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>

    </div>
  );
}
