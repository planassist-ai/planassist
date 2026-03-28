"use client";

import Link from "next/link";

interface UpgradePromptProps {
  feature: string;
  description: string;
}

const PAID_FEATURES = [
  "Full county intelligence — all policies, warnings, and document links",
  "Application status tracking with plain-English explanations",
  "Document interpreter — RFIs, conditions, appeals decoded instantly",
  "Application monitoring with email alerts on status changes",
  "Newspaper notice generator with statutory wording templates",
];

function handleStripe() {
  // Stripe integration coming soon — placeholder
  alert(
    "Payment is coming soon.\n\nTo get early access, email us at hello@planassist.ie and we\u2019ll set you up manually."
  );
}

export function UpgradePrompt({ feature, description }: UpgradePromptProps) {
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
          Everything included for €39
        </p>
        <ul className="space-y-3">
          {PAID_FEATURES.map((item, i) => (
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

      {/* Price + CTA */}
      <div className="text-center space-y-3">
        <button
          onClick={handleStripe}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold py-4 px-8 rounded-xl transition-colors text-sm"
        >
          Get access — €39 one-off
        </button>

        <p className="text-xs text-gray-400">
          Or use with an{" "}
          <Link href="/dashboard" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
            Architect subscription
          </Link>
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
      </div>

    </div>
  );
}
