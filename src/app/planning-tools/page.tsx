"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Tool {
  href: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

// ── Tool definitions ───────────────────────────────────────────────────────────

const FREE_TOOLS: Tool[] = [
  {
    href: "/check",
    title: "Permission Checker",
    desc: "Find out whether your project needs planning permission under Irish law — extensions, new builds, outbuildings, and more.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    href: "/checklist",
    title: "Document Checklist",
    desc: "Get a tailored list of every document you need to submit with your planning application for your county and project type.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/check",
    title: "Local Needs Questionnaire",
    desc: "Answer a short set of questions to see whether you meet the local needs test for a rural one-off dwelling in your county.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    href: "/fee-calculator",
    title: "Fee Calculator",
    desc: "Calculate the exact planning fee for your application based on development type and scale before you submit.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.65 4.5 4.757V19.5a2.25 2.25 0 002.25 2.25h10.5a2.25 2.25 0 002.25-2.25V4.757c0-1.108-.806-2.057-1.907-2.185A48.507 48.507 0 0012 2.25z" />
      </svg>
    ),
  },
  {
    href: "/find-a-professional",
    title: "Find a Professional",
    desc: "Browse our directory of architects, planning consultants, and architectural technologists across all 26 counties.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/grants",
    title: "Grants Finder",
    desc: "See which government grants and SEAI energy schemes are available for your project — no account required for the basics.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const HOMEOWNER_TOOLS: Tool[] = [
  {
    href: "/status",
    title: "Application Monitoring",
    desc: "Track your live planning application through every stage, get plain-English status updates, and be notified of any changes.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    ),
  },
  {
    href: "/interpreter",
    title: "Document Interpreter",
    desc: "Upload any planning document — conditions, RFIs, appeal decisions — and get a clear breakdown of what it means and what to do next.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    href: "/check",
    title: "Full County Intelligence",
    desc: "Get detailed county-by-county planning policy analysis — strictness ratings, local needs criteria, and what planners in your county look for.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    title: "Newspaper Notice Finder",
    desc: "Find the correct local newspapers for your statutory planning notice — required for all planning applications in Ireland.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
      </svg>
    ),
  },
  {
    href: "/self-build",
    title: "Self-Build Tracker",
    desc: "A step-by-step guide to self-building in Ireland — from site acquisition and planning through to completion and snagging.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    href: "/grants",
    title: "Full Grants Checker",
    desc: "Get personalised grant recommendations across SEAI, the Department of Housing, and local council schemes matched to your exact project.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];


// ── CTAs ───────────────────────────────────────────────────────────────────────

function HomeownerToolCTA({ href, isPaid, isLoggedIn }: { href: string; isPaid: boolean; isLoggedIn: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceId: "price_1TG5pE1P7njYP3N2t0xrbpR4", redirectTo: href }),
      });
      const data = await res.json() as { url?: string; error?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  if (isPaid) {
    return (
      <Link
        href={href}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
      >
        Use This Tool
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    );
  }

  if (!isLoggedIn) {
    return (
      <Link
        href={`/signup?next=${encodeURIComponent(href)}`}
        className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Sign up — €39 per application
      </Link>
    );
  }

  return (
    <button
      onClick={handleCheckout}
      disabled={loading}
      className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Redirecting…
        </>
      ) : (
        "Upgrade — €39 per application"
      )}
    </button>
  );
}

function UpgradeBanner({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [loading, setLoading] = useState(false);

  async function handleCheckout() {
    setLoading(true);
    try {
      const res = await fetch("/api/create-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ priceId: "price_1TG5pE1P7njYP3N2t0xrbpR4", redirectTo: "/planning-tools" }),
      });
      const data = await res.json() as { url?: string };
      if (data.url) window.location.href = data.url;
    } catch {
      setLoading(false);
    }
  }

  return (
    <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
      <p className="text-sm text-green-800 flex-1 leading-relaxed">
        <strong>€39 per application — one-off payment.</strong> Covers your full planning journey for this project, from permission check to final decision. Not a subscription.
      </p>
      {isLoggedIn ? (
        <button
          onClick={handleCheckout}
          disabled={loading}
          className="shrink-0 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors text-center disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Redirecting…" : "Upgrade now — €39 per application"}
        </button>
      ) : (
        <Link
          href="/signup?next=/planning-tools"
          className="shrink-0 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors text-center"
        >
          Get started — €39 per application
        </Link>
      )}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function PlanningToolsPage() {
  const { isLoggedIn, isPaid, loading } = useAuthStatus();

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Planning Tools
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl">
            Everything you need to navigate the Irish planning system — from your first permission check to final decision.
          </p>
        </div>

        {/* ── Section 1: Free Tools ────────────────────────────────────────── */}
        <section className="mb-12 sm:mb-16">
          <div className="flex items-center gap-3 mb-5">
            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-200">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Free — no account needed
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FREE_TOOLS.map(({ href, title, desc, icon }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-4 shrink-0">
                  {icon}
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-1.5">{title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
                <Link
                  href={href}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors"
                >
                  Use for free
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* ── Section 2: Homeowner Tools ───────────────────────────────────── */}
        <section className="mb-12 sm:mb-16">
          <div className="mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
              For Homeowners — €39 per application, nothing more.
            </h2>
            <p className="text-sm text-gray-500">
              Pay once per planning application and get full access to every homeowner tool for that project — from first permission check through to final decision. No subscription, no renewal, no hidden fees.
            </p>
          </div>

          {!isPaid && !loading && (
            <UpgradeBanner isLoggedIn={isLoggedIn} />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {HOMEOWNER_TOOLS.map(({ href, title, desc, icon }) => (
              <div
                key={title}
                className={`bg-white border border-gray-200 rounded-2xl p-5 flex flex-col ${!isPaid && !loading ? "opacity-90" : ""}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 shrink-0 ${isPaid ? "bg-green-50 text-green-600" : "bg-gray-100 text-gray-400"}`}>
                  {icon}
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-1.5">{title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
                <HomeownerToolCTA href={href} isPaid={isPaid} isLoggedIn={isLoggedIn} />
              </div>
            ))}
          </div>
        </section>

        {/* ── For professionals callout ────────────────────────────────────── */}
        <div className="mt-2 pt-8 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Are you a planning professional?{" "}
            <Link href="/for-architects" className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-2 transition-colors">
              See professional tools for architects and planning consultants →
            </Link>
          </p>
        </div>

      </div>
    </AppShell>
  );
}
