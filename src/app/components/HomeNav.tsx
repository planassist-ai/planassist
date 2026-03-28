"use client";

import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Features", href: "#features", isAnchor: true },
  { label: "How It Works", href: "#how-it-works", isAnchor: true },
  { label: "Application Status", href: "/status", isAnchor: false },
  { label: "Document Interpreter", href: "/interpreter", isAnchor: false },
  { label: "Document Checklist", href: "/checklist", isAnchor: false },
];

export function HomeNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <span className="text-xl font-bold text-green-600 tracking-tight">Planr</span>

          {/* Desktop nav (lg+) */}
          <div className="hidden lg:flex items-center gap-1 text-sm text-gray-500">
            {NAV_ITEMS.map(({ label, href, isAnchor }) =>
              isAnchor ? (
                <a
                  key={href}
                  href={href}
                  className="px-3 py-2 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="px-3 py-2 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
                >
                  {label}
                </Link>
              )
            )}
          </div>

          {/* Hamburger (mobile + tablet) */}
          <button
            type="button"
            className="lg:hidden p-2 -mr-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile / tablet dropdown */}
        {open && (
          <div className="lg:hidden border-t border-gray-100 pb-4 pt-2 space-y-0.5">
            {NAV_ITEMS.map(({ label, href, isAnchor }) =>
              isAnchor ? (
                <a
                  key={href}
                  href={href}
                  className="block px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              ) : (
                <Link
                  key={href}
                  href={href}
                  className="block px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {label}
                </Link>
              )
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
