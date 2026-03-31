"use client";

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

const PRO_TOOLS: Tool[] = [
  {
    href: "/dashboard",
    title: "Live Pipeline Dashboard",
    desc: "Your full client application portfolio in one view. Status, deadlines, RFI flags, and statutory timelines — updated in real time across every active application.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
  },
  {
    href: "/interpreter",
    title: "Client Document Management",
    desc: "Interpret RFIs, conditions, and appeal decisions across your entire client base. Every document tracked per project, not per session — with flagged action items and deadlines for each client.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    title: "One-Click Client Updates",
    desc: "Send a plain-English status update to a client directly from their application record. No email drafting, no copy-paste — one click logs the update and sends it.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
  {
    href: "/planning-statement",
    title: "Planning Statement Generator",
    desc: "Generate a professional draft planning statement for any application — tailored to project type, county policy, and local needs criteria. Edit and export in minutes.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
      </svg>
    ),
  },
  {
    href: "/design-check",
    title: "Design Guide Checker",
    desc: "Check any design against local authority design guidelines and urban design standards before you submit — saving pre-submission meetings and expensive revisions.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: "/dashboard",
    title: "County Document Library",
    desc: "Every county development plan, local area plan, and design guideline in one searchable place — cross-referenced to your active applications so you always know which policy applies.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
      </svg>
    ),
  },
];

// ── CTAs ───────────────────────────────────────────────────────────────────────

function HomeownerToolCTA({ href, isPaid, isLoggedIn }: { href: string; isPaid: boolean; isLoggedIn: boolean }) {
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
  return (
    <Link
      href="/signup"
      className="mt-4 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
    >
      {isLoggedIn ? "Upgrade — €39 per application" : "Sign Up — €39 per application"}
    </Link>
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
            <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
              <p className="text-sm text-green-800 flex-1 leading-relaxed">
                <strong>€39 per application — one-off payment.</strong> Covers your full planning journey for this project, from permission check to final decision. Not a subscription.
              </p>
              <Link
                href="/signup"
                className="shrink-0 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors text-center"
              >
                {isLoggedIn ? "Upgrade now — €39 per application" : "Get started — €39 per application"}
              </Link>
            </div>
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

        {/* ── Section 3: Architect & Professional Tools ────────────────────── */}
        <section>

          {/* Section header */}
          <div className="mb-8">
            <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-200 mb-4">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
              For Architects &amp; Planning Professionals
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-snug">
              Built for professionals managing multiple applications — not just your own.
            </h2>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-2xl">
              The homeowner tier helps someone navigate one application. The architect tier runs your entire practice — pipeline, clients, documents, and deadlines — from a single dashboard.
            </p>
          </div>

          {/* Homeowner vs Architect comparison */}
          <div className="mb-8 rounded-2xl border border-gray-200 overflow-hidden">
            <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200">
              <div className="px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide" />
              <div className="px-4 py-3 border-l border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Homeowner</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">€39 per application</p>
              </div>
              <div className="px-4 py-3 border-l border-blue-200 bg-blue-50">
                <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Architect</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5">Practice plan</p>
              </div>
            </div>
            {[
              {
                label: "Application monitoring",
                homeowner: "1 application",
                architect: "Unlimited — your full client pipeline",
                architectHighlight: true,
              },
              {
                label: "Document interpretation",
                homeowner: "Your own documents only",
                architect: "All client documents, tracked per project",
                architectHighlight: true,
              },
              {
                label: "Workflow mode",
                homeowner: "React when something happens",
                architect: "Proactive flags — issues surface before clients ask",
                architectHighlight: true,
              },
              {
                label: "Client communication",
                homeowner: "Not included",
                architect: "One-click status updates sent directly from the dashboard",
                architectHighlight: true,
              },
              {
                label: "Planning statements",
                homeowner: "Not included",
                architect: "Draft generated per application — edit and export",
                architectHighlight: true,
              },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-3 ${i < 4 ? "border-b border-gray-100" : ""}`}>
                <div className="px-4 py-3.5 text-sm font-medium text-gray-600">{row.label}</div>
                <div className="px-4 py-3.5 border-l border-gray-200 text-sm text-gray-500">{row.homeowner}</div>
                <div className="px-4 py-3.5 border-l border-blue-200 bg-blue-50 text-sm font-medium text-blue-800">{row.architect}</div>
              </div>
            ))}
          </div>

          {/* A typical week */}
          <div className="mb-8 bg-gray-900 rounded-2xl p-6 sm:p-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">In practice</p>
            <h3 className="text-lg sm:text-xl font-bold text-white mb-6">
              A typical week for an architect on Granted
            </h3>
            <div className="space-y-0">
              {[
                {
                  day: "Mon",
                  time: "9:00am",
                  event: "Dashboard opens to show 2 applications need attention this week — one approaching its statutory deadline, one with an RFI response due in 12 days.",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3" />
                    </svg>
                  ),
                },
                {
                  day: "Tue",
                  time: "11:30am",
                  event: "RFI arrives on a Cork application. Granted flags it instantly — plain-English breakdown of the 3 items, urgency levels set, deadline calculated automatically.",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                    </svg>
                  ),
                  highlight: true,
                },
                {
                  day: "Wed",
                  time: "2:15pm",
                  event: "One-click client updates sent to 3 clients in under 2 minutes — each update references their application directly. No emails drafted from scratch.",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  ),
                },
                {
                  day: "Fri",
                  time: "4:00pm",
                  event: "New application added to the dashboard. Submission checklist generated for the county and project type. Newspaper notice requirement confirmed — correct papers listed automatically.",
                  icon: (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  ),
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 relative">
                  {/* Timeline line */}
                  {i < 3 && (
                    <div className="absolute left-[27px] top-10 bottom-0 w-px bg-gray-700" />
                  )}
                  {/* Day badge + icon */}
                  <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                    <div className={`w-[54px] text-center text-xs font-bold px-2 py-0.5 rounded-md ${item.highlight ? "bg-amber-500 text-gray-900" : "bg-gray-700 text-gray-300"}`}>
                      {item.day}
                    </div>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.highlight ? "bg-amber-500 text-gray-900" : "bg-gray-700 text-gray-400"}`}>
                      {item.icon}
                    </div>
                  </div>
                  {/* Content */}
                  <div className={`flex-1 pb-6 ${i === 3 ? "pb-0" : ""}`}>
                    <p className="text-xs text-gray-500 mb-1">{item.time}</p>
                    <p className={`text-sm leading-relaxed ${item.highlight ? "text-white font-medium" : "text-gray-300"}`}>
                      {item.event}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pro tool cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {PRO_TOOLS.map(({ title, desc, icon }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 shrink-0">
                  {icon}
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-1.5">{title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
                <div className="mt-4">
                  <a
                    href="mailto:hello@granted.ie"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Request Access — Talk To Us
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* CTA callout */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm font-semibold text-gray-900 mb-0.5">Ready to see it with your own applications?</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                We onboard practices individually — usually a 20-minute call and same-day access. Works for sole practitioners through to multi-county studios.
              </p>
            </div>
            <a
              href="mailto:hello@granted.ie"
              className="shrink-0 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors text-center"
            >
              Request Access
            </a>
          </div>

        </section>

      </div>
    </AppShell>
  );
}
