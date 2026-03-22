"use client";

import { useState } from "react";
import Link from "next/link";

export function HomeNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          <span className="text-xl font-bold text-green-600 tracking-tight">PlanAssist</span>

          {/* Desktop nav (lg+) */}
          <div className="hidden lg:flex items-center gap-1 text-sm text-gray-500">
            <a
              href="#features"
              className="px-3 py-2 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="px-3 py-2 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              How it works
            </a>
            <Link
              href="/status"
              className="px-3 py-2 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Application Status
            </Link>
            <Link
              href="/interpreter"
              className="px-3 py-2 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              Document Interpreter
            </Link>
            <Link
              href="/check"
              className="ml-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Get started
            </Link>
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
            <a
              href="#features"
              className="block px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              How it works
            </a>
            <Link
              href="/status"
              className="block px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              Application Status
            </Link>
            <Link
              href="/interpreter"
              className="block px-3 py-2.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
              onClick={() => setOpen(false)}
            >
              Document Interpreter
            </Link>
            <div className="pt-2 px-3">
              <Link
                href="/check"
                className="block text-center bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium transition-colors text-sm"
                onClick={() => setOpen(false)}
              >
                Get started — it&apos;s free
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
