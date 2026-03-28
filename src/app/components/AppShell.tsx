"use client";

import { useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SiteFooter } from "./SiteFooter";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import { createClient } from "@/lib/supabase/browser";

const NAV_ITEMS = [
  {
    href: "/#features",
    label: "Features",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? "text-green-600" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
        />
      </svg>
    ),
  },
  {
    href: "/#how-it-works",
    label: "How It Works",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? "text-green-600" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"
        />
      </svg>
    ),
  },
  {
    href: "/status",
    label: "Application Status",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? "text-green-600" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
        />
      </svg>
    ),
  },
  {
    href: "/interpreter",
    label: "Document Interpreter",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? "text-green-600" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
        />
      </svg>
    ),
  },
  {
    href: "/checklist",
    label: "Document Checklist",
    icon: (active: boolean) => (
      <svg
        className={`w-6 h-6 transition-colors ${active ? "text-green-600" : "text-gray-400"}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.75}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
        />
      </svg>
    ),
  },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname               = usePathname();
  const router                 = useRouter();
  const { isLoggedIn, userEmail } = useAuthStatus();

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  // First letter of the email for the avatar.
  const avatarLetter = userEmail ? userEmail[0].toUpperCase() : null;

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Desktop top nav (lg+) ─────────────────────────── */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
            Planr
          </Link>
          <div className="flex items-center gap-1">
            <nav className="flex items-center gap-1">
              {NAV_ITEMS.map(({ href, label }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-green-50 text-green-700"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Auth actions */}
            <div className="ml-4 pl-4 border-l border-gray-200 flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <span className="text-sm text-gray-500 max-w-[180px] truncate" title={userEmail ?? ""}>
                    {userEmail}
                  </span>
                  <button
                    onClick={handleSignOut}
                    className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Sign up free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Shared layout row ─────────────────────────────── */}
      <div className="md:flex">

        {/* ── Tablet side nav (md–lg) ──────────────────────── */}
        <aside className="hidden md:flex lg:hidden flex-col w-60 shrink-0 min-h-screen bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
          <div className="px-5 h-16 flex items-center border-b border-gray-100">
            <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
              Planr
            </Link>
          </div>
          <nav className="p-3 space-y-1 flex-1">
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    active
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {icon(active)}
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Tablet nav footer — auth state */}
          <div className="p-4 border-t border-gray-100 space-y-2">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2.5 px-1">
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {avatarLetter}
                  </div>
                  <span className="text-xs text-gray-600 truncate min-w-0" title={userEmail ?? ""}>
                    {userEmail}
                  </span>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left text-xs text-gray-400 hover:text-gray-700 px-1 transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <div className="space-y-1.5">
                <Link
                  href="/login"
                  className="block w-full text-center text-xs font-medium text-gray-600 hover:text-gray-900 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  href="/signup"
                  className="block w-full text-center text-xs font-semibold bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors"
                >
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="md:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between sticky top-0 z-30">
            <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
              Planr
            </Link>
            {isLoggedIn ? (
              <button
                onClick={handleSignOut}
                className="text-xs text-gray-500 hover:text-gray-800 transition-colors"
              >
                Sign out
              </button>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>

          {/* Content — bottom padding clears the mobile tab bar */}
          <div className="pb-[calc(6rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
            <SiteFooter />
          </div>
        </main>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map(({ href, label, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? "text-green-600" : "text-gray-400"
                }`}
              >
                {icon(active)}
                <span
                  className={`text-[8px] font-semibold tracking-wide leading-tight text-center px-0.5 ${
                    active ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
