"use client";

import { useState } from "react";

interface TrialBannerProps {
  daysLeft: number;
  onSubscribe: () => void;
}

export function TrialBanner({ daysLeft, onSubscribe }: TrialBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  const isExpired = daysLeft <= 0;
  const isUrgent = !isExpired && daysLeft <= 7;

  const bg = isExpired
    ? "bg-red-600"
    : isUrgent
    ? "bg-orange-500"
    : "bg-amber-50 border border-amber-200";

  const text = isExpired || isUrgent ? "text-white" : "text-amber-900";
  const subText = isExpired || isUrgent ? "text-white/80" : "text-amber-700";
  const btnBase = "text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap";
  const subscribeBtn =
    isExpired || isUrgent
      ? `${btnBase} bg-white text-gray-900 hover:bg-gray-100`
      : `${btnBase} bg-amber-600 hover:bg-amber-700 text-white`;
  const dismissBtn =
    isExpired || isUrgent
      ? "text-white/60 hover:text-white/90"
      : "text-amber-600 hover:text-amber-800";

  return (
    <div className={`mb-6 rounded-2xl overflow-hidden ${bg}`}>
      <div className="px-4 sm:px-5 py-4 flex items-center gap-4 flex-wrap">

        {/* Icon */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isExpired || isUrgent ? "bg-white/20" : "bg-amber-100"
        }`}>
          {isExpired ? (
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          ) : (
            <svg className={`w-4 h-4 ${isUrgent ? "text-white" : "text-amber-600"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>

        {/* Message */}
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-semibold leading-snug ${text}`}>
            {isExpired
              ? "Your free trial has ended"
              : isUrgent
              ? `${daysLeft} day${daysLeft === 1 ? "" : "s"} left in your free trial`
              : `Free trial — ${daysLeft} day${daysLeft === 1 ? "" : "s"} remaining`}
          </p>
          <p className={`text-xs mt-0.5 leading-snug ${subText}`}>
            {isExpired
              ? "Subscribe to continue using the Architect Dashboard and all paid features."
              : isUrgent
              ? "Your trial is almost over. Subscribe now to keep uninterrupted access."
              : "Subscribe before your trial ends to keep full access to all features."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <button onClick={onSubscribe} className={subscribeBtn}>
            Subscribe
          </button>
          {!isExpired && (
            <button
              onClick={() => setDismissed(true)}
              className={`text-xs ${dismissBtn} transition-colors`}
              aria-label="Dismiss banner"
            >
              Dismiss
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
