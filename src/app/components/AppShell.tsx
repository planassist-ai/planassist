"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/check",
    label: "Permission Checker",
    shortLabel: "Check",
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
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    href: "/status",
    label: "Application Status",
    shortLabel: "Status",
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
    shortLabel: "Docs",
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
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Desktop top nav (lg+) ─────────────────────────── */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
            PlanAssist
          </Link>
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
        </div>
      </header>

      {/* ── Shared layout row ─────────────────────────────── */}
      <div className="md:flex">

        {/* ── Tablet side nav (md–lg) ──────────────────────── */}
        <aside className="hidden md:flex lg:hidden flex-col w-60 shrink-0 min-h-screen bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
          <div className="px-5 h-16 flex items-center border-b border-gray-100">
            <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
              PlanAssist
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
          <div className="p-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 leading-relaxed">
              Guidance only — not a substitute for professional planning advice.
            </p>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          {/* Mobile top bar */}
          <div className="md:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center sticky top-0 z-30">
            <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
              PlanAssist
            </Link>
          </div>

          {/* Content — bottom padding clears the mobile tab bar */}
          <div className="pb-24 md:pb-0">
            {children}
          </div>
        </main>
      </div>

      {/* ── Mobile bottom tab bar ─────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-16">
          {NAV_ITEMS.map(({ href, shortLabel, icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                  active ? "text-green-600" : "text-gray-400"
                }`}
              >
                {icon(active)}
                <span
                  className={`text-[10px] font-semibold tracking-wide ${
                    active ? "text-green-600" : "text-gray-400"
                  }`}
                >
                  {shortLabel}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  );
}
