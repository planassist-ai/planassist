"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const STORAGE_KEY = "planassist_cookie_consent";

export type CookieConsentValue = "all" | "necessary";

/**
 * Read the stored cookie consent choice from localStorage.
 * Returns null if no choice has been made yet.
 * Safe to call in browser only.
 */
export function getCookieConsent(): CookieConsentValue | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "all" || stored === "necessary") return stored;
  return null;
}

export function CookieConsentBanner() {
  // undefined = not yet hydrated (avoid SSR mismatch)
  // null      = hydrated, no choice stored → show banner
  // "all"/"necessary" = choice stored → hide banner
  const [consent, setConsent] = useState<CookieConsentValue | null | undefined>(
    undefined
  );

  useEffect(() => {
    setConsent(getCookieConsent());
  }, []);

  function handleAccept(choice: CookieConsentValue) {
    localStorage.setItem(STORAGE_KEY, choice);
    setConsent(choice);

    if (choice === "necessary") {
      // Disable any non-essential tracking loaded after consent.
      // Add analytics opt-out calls here when analytics are introduced,
      // e.g. window['ga-disable-MEASUREMENT_ID'] = true;
    }
  }

  // Don't render while hydrating, or once a choice has been made
  if (consent !== null) return null;

  return (
    <div
      className="fixed left-0 right-0 z-[55] px-3 py-3 md:px-4 md:py-4 bottom-[calc(4rem+env(safe-area-inset-bottom))] md:bottom-0"
      role="dialog"
      aria-label="Cookie consent"
      aria-live="polite"
    >
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl shadow-[0_-2px_24px_rgba(0,0,0,0.08)] px-5 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">

          {/* Icon */}
          <div className="hidden sm:flex shrink-0 w-9 h-9 rounded-full bg-green-50 items-center justify-center mt-0.5">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              We use cookies
            </p>
            <p className="text-sm text-gray-600 leading-relaxed">
              Granted uses essential cookies to keep you signed in and make the
              app work reliably. With your permission we also use analytics cookies
              to understand how the app is used so we can improve it. We never sell
              your data.{" "}
              <Link
                href="/privacy"
                className="text-green-600 underline underline-offset-2 hover:text-green-700 whitespace-nowrap"
              >
                Privacy policy
              </Link>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex flex-row sm:flex-col gap-2 shrink-0 sm:min-w-[10rem]">
            <button
              onClick={() => handleAccept("all")}
              className="flex-1 sm:flex-none px-4 py-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-semibold rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
            >
              Accept all
            </button>
            <button
              onClick={() => handleAccept("necessary")}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg border border-gray-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
            >
              Necessary only
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
