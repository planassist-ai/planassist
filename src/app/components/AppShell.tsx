"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SiteFooter } from "./SiteFooter";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import { createClient } from "@/lib/supabase/browser";

// ── Icons ──────────────────────────────────────────────────────────────────────

const HomeIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-6 h-6 ${active ? "text-green-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
  </svg>
);

const CheckIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-6 h-6 ${active ? "text-green-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ToolsIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-6 h-6 ${active ? "text-green-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L3 3l1.5 1.5 3.75.75 5.91 5.91" />
  </svg>
);

const DashboardIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-6 h-6 ${active ? "text-green-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
  </svg>
);

const FindProIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-6 h-6 ${active ? "text-green-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AskIcon = ({ active }: { active: boolean }) => (
  <svg className={`w-6 h-6 ${active ? "text-green-600" : "text-gray-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
  </svg>
);

// ── Nav definitions ─────────────────────────────────────────────────────────────

// Desktop top nav — always visible items
const DESKTOP_NAV = [
  { href: "/check",               label: "Permission Checker" },
  { href: "/ask",                 label: "Ask a Question"     },
  { href: "/planning-tools",      label: "Planning Tools"     },
  { href: "/find-a-professional", label: "Find a Professional" },
];

// Sidebar & drawer nav (includes dashboard — filtered at render time)
const ALL_SIDEBAR_NAV = [
  { href: "/",                    label: "Home",                Icon: HomeIcon,      architectOnly: false },
  { href: "/check",               label: "Permission Checker",  Icon: CheckIcon,     architectOnly: false },
  { href: "/ask",                 label: "Ask a Question",      Icon: AskIcon,       architectOnly: false },
  { href: "/planning-tools",      label: "Planning Tools",      Icon: ToolsIcon,     architectOnly: false },
  { href: "/find-a-professional", label: "Find a Professional", Icon: FindProIcon,   architectOnly: false },
  { href: "/dashboard",           label: "Dashboard",           Icon: DashboardIcon, architectOnly: true  },
];

// Bottom tab bar — max 4 items (dashboard conditionally appended at render time)
const BASE_BOTTOM_TABS = [
  { href: "/",               label: "Home",  Icon: HomeIcon  },
  { href: "/check",          label: "Check", Icon: CheckIcon },
  { href: "/planning-tools", label: "Tools", Icon: ToolsIcon },
];
const DASHBOARD_TAB = { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon };

// ── AppShell ───────────────────────────────────────────────────────────────────

export function AppShell({
  children,
  focusedMode = false,
  onBack,
}: {
  children: React.ReactNode;
  focusedMode?: boolean;
  onBack?: () => void;
}) {
  const pathname                                    = usePathname();
  const router                                      = useRouter();
  const { isLoggedIn, isArchitect, isPaid, userEmail } = useAuthStatus();
  const [drawerOpen, setDrawerOpen]                 = useState(false);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  const avatarLetter = userEmail ? userEmail[0].toUpperCase() : null;

  // Dashboard only visible to logged-in architects
  const showDashboard = isLoggedIn && isArchitect;

  const sidebarNav = ALL_SIDEBAR_NAV.filter((item) => !item.architectOnly || showDashboard);
  const bottomTabs = showDashboard
    ? [...BASE_BOTTOM_TABS, DASHBOARD_TAB]
    : BASE_BOTTOM_TABS;
  const desktopNav = showDashboard
    ? [...DESKTOP_NAV, { href: "/dashboard", label: "Dashboard" }]
    : DESKTOP_NAV;

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href);

  // ── Focused / assessment mode ──────────────────────────────────────────────
  if (focusedMode) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
              Granted
            </Link>
            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}
          </div>
        </header>
        <main>
          {children}
          <SiteFooter />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── Desktop top nav (lg+) ─────────────────────────────────────────── */}
      <header className="hidden lg:block bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-green-600 tracking-tight shrink-0">
            Granted
          </Link>
          <nav className="flex items-center gap-1">
            {desktopNav.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(href)
                    ? "bg-green-50 text-green-700"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                {isPaid && !isArchitect && (
                  <Link href="/my-planning" className="text-sm font-medium text-green-700 hover:text-green-800 transition-colors">
                    My Portal
                  </Link>
                )}
                <span className="text-sm text-gray-500 max-w-[160px] truncate" title={userEmail ?? ""}>
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
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                  Sign in
                </Link>
                <Link href="/signup" className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Sign up free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Shared layout row ─────────────────────────────────────────────── */}
      <div className="md:flex">

        {/* ── Tablet side nav (md–lg) ───────────────────────────────────── */}
        <aside className="hidden md:flex lg:hidden flex-col w-56 shrink-0 min-h-screen bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
          <div className="px-5 h-16 flex items-center border-b border-gray-100">
            <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
              Granted
            </Link>
          </div>
          <nav className="p-3 space-y-1 flex-1">
            {sidebarNav.map(({ href, label, Icon }) => {
              const active = isActive(href);
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
                  <Icon active={active} />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-100 space-y-2">
            {isLoggedIn ? (
              <>
                <div className="flex items-center gap-2.5 px-1">
                  <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {avatarLetter}
                  </div>
                  <span className="text-xs text-gray-600 truncate min-w-0" title={userEmail ?? ""}>{userEmail}</span>
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
                <Link href="/login" className="block w-full text-center text-xs font-medium text-gray-600 hover:text-gray-900 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  Sign in
                </Link>
                <Link href="/signup" className="block w-full text-center text-xs font-semibold bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors">
                  Sign up free
                </Link>
              </div>
            )}
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────────────────── */}
        <main className="flex-1 min-w-0">

          {/* Mobile top bar */}
          <div className="md:hidden bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between sticky top-0 z-30">
            <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
              Granted
            </Link>
            <button
              onClick={() => setDrawerOpen(true)}
              className="p-2 -mr-2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="pb-[calc(5rem+env(safe-area-inset-bottom))] md:pb-0">
            {children}
            <SiteFooter />
          </div>
        </main>
      </div>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
          <div className="relative ml-auto w-72 max-w-[85vw] bg-white h-full flex flex-col shadow-xl">
            <div className="px-5 h-14 flex items-center justify-between border-b border-gray-100">
              <Link href="/" className="text-lg font-bold text-green-600 tracking-tight" onClick={() => setDrawerOpen(false)}>
                Granted
              </Link>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-2 -mr-2 text-gray-400 hover:text-gray-700 transition-colors"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
              {sidebarNav.map(({ href, label, Icon }) => {
                const active = isActive(href);
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm transition-colors ${
                      active
                        ? "bg-green-50 text-green-700 font-medium"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon active={active} />
                    <span>{label}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-gray-100 space-y-2">
              {isLoggedIn ? (
                <>
                  <div className="flex items-center gap-2.5 px-1 mb-1">
                    <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {avatarLetter}
                    </div>
                    <span className="text-xs text-gray-600 truncate min-w-0" title={userEmail ?? ""}>{userEmail}</span>
                  </div>
                  <button
                    onClick={() => { handleSignOut(); setDrawerOpen(false); }}
                    className="w-full text-left text-sm text-gray-500 hover:text-gray-800 px-1 transition-colors"
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <div className="space-y-2">
                  <Link href="/login" onClick={() => setDrawerOpen(false)} className="block w-full text-center text-sm font-medium text-gray-700 hover:text-gray-900 py-2.5 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200">
                    Sign in
                  </Link>
                  <Link href="/signup" onClick={() => setDrawerOpen(false)} className="block w-full text-center text-sm font-semibold bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-xl transition-colors">
                    Sign up free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile bottom tab bar ─────────────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-stretch h-16">
          {bottomTabs.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors ${
                  active ? "text-green-600" : "text-gray-400"
                }`}
              >
                <Icon active={active} />
                <span className={`text-[10px] font-semibold tracking-wide leading-tight ${active ? "text-green-600" : "text-gray-400"}`}>
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
