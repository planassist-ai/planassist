import Link from "next/link";
import { HomeNav } from "@/app/components/HomeNav";
import { SiteFooter } from "@/app/components/SiteFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      <HomeNav />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-20 lg:py-24">
        <div className="text-center mb-10 sm:mb-14">
          <span className="inline-block bg-green-50 text-green-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-full border border-green-200 mb-4">
            Built for the Irish planning system
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight tracking-tight text-gray-900">
            Your planning questions, answered.
          </h1>
        </div>

        {/* Two entry cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">

          {/* Homeowner card — green */}
          <div className="relative bg-green-600 rounded-2xl p-7 sm:p-8 flex flex-col overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
                <circle cx="350" cy="-30" r="180" fill="white" />
              </svg>
            </div>
            <div className="relative">
              <p className="text-xs font-semibold text-green-200 uppercase tracking-widest mb-3">For homeowners</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug">
                Planning a project?
              </h2>
              <p className="text-green-100 text-sm sm:text-base leading-relaxed mb-7">
                Check if you need permission, track your application, and understand every planning document in plain English.
              </p>
              <Link
                href="/signup?type=homeowner"
                className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-semibold px-5 py-3 rounded-xl text-sm sm:text-base transition-colors"
              >
                Get Started — it&apos;s free
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Professional card — blue */}
          <div className="relative bg-blue-700 rounded-2xl p-7 sm:p-8 flex flex-col overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 400 300" fill="none">
                <circle cx="50" cy="330" r="200" fill="white" />
              </svg>
            </div>
            <div className="relative">
              <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-3">For professionals</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug">
                Managing planning applications?
              </h2>
              <p className="text-blue-100 text-sm sm:text-base leading-relaxed mb-7">
                Pipeline dashboard, client portal, county intelligence and deadline alerts for Irish planning professionals.
              </p>
              <Link
                href="/for-architects"
                className="inline-flex items-center gap-2 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-5 py-3 rounded-xl text-sm sm:text-base transition-colors"
              >
                See How It Works
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Based on the Planning &amp; Development Acts 2000 &amp; 2024 · Updated for March 2026 exemptions
        </p>
      </section>

      {/* ── Scenario Cards ──────────────────────────────────── */}
      <section className="border-t border-gray-100 py-14 sm:py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-gray-900">
            Common planning scenarios
          </h2>
          <p className="text-gray-500 text-center mb-10 sm:mb-12 text-sm sm:text-base">
            Try a realistic example — or start fresh with your own project.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                badge: "Extension",
                badgeClass: "bg-green-100 text-green-700",
                title: "Rear extension, Dublin",
                sub: "28 sqm single-storey extension to a semi-detached house. Do I need permission?",
                scenario: "rear-extension",
              },
              {
                badge: "New Build",
                badgeClass: "bg-blue-100 text-blue-700",
                title: "Rural new build, Kerry",
                sub: "New dwelling on a family landholding in a rural area. What are the prospects?",
                scenario: "rural-new-build",
              },
              {
                badge: "Retention",
                badgeClass: "bg-amber-100 text-amber-700",
                title: "Retention, Cork",
                sub: "Works carried out without permission. Can I apply for retention?",
                scenario: "retention",
              },
            ].map((s) => (
              <Link
                key={s.scenario}
                href={`/check?scenario=${s.scenario}`}
                className="group bg-white border border-gray-200 rounded-2xl p-5 hover:border-green-400 hover:shadow-md transition-all"
              >
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${s.badgeClass} mb-3 inline-block`}>
                  {s.badge}
                </span>
                <h3 className="text-base font-bold text-gray-900 mb-1.5">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{s.sub}</p>
                <div className="flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:gap-2 transition-all">
                  Check this scenario
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sample Output ──────────────────────────────────── */}
      <section className="border-t border-gray-100 py-14 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-gray-900">
            See what you&apos;ll get
          </h2>
          <p className="text-gray-500 text-center mb-10 sm:mb-14 text-sm sm:text-base">
            A clear, plain-English answer with the key planning facts — in under a minute.
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sample EXEMPT result */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Permission checker result</p>
              <div className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full bg-green-100 text-green-700 border border-green-200">
                    <span className="w-2 h-2 rounded-full bg-green-600 flex-shrink-0" />
                    Exempt from Permission
                  </span>
                </div>
                <h3 className="text-lg font-bold text-green-700 mb-3">
                  Your rear extension is likely exempt from planning permission.
                </h3>
                <p className="text-sm text-green-900 leading-relaxed mb-4">
                  A single-storey rear extension of 28 sqm to a semi-detached house in Dublin falls within the exempted development thresholds under the March 2026 regulations. No planning application is required before starting works.
                </p>
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Key factors</p>
                  <ul className="space-y-1.5">
                    {[
                      "Extension size (28 sqm) within the 40 sqm exempt threshold",
                      "Single-storey — roof height restriction is not a concern",
                      "Rear garden remains above the 25 sqm minimum required",
                    ].map((pt, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm text-green-900">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-green-600 flex-shrink-0" />
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl px-4 py-3 text-sm border bg-green-100 border-green-200 text-green-700">
                  <span className="font-semibold">Note: </span>Confirm all previous extensions combined do not exceed 40 sqm before commencing works.
                </div>
                <p className="text-xs text-gray-400 mt-3">
                  Based on: Planning &amp; Development Regulations 2001, Schedule 2, Part 1, Class 1 (as updated March 2026)
                </p>
              </div>
            </div>

            {/* Sample RFI interpreter result */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Document interpreter result</p>
              <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 h-full">
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    <span className="w-2 h-2 rounded-full bg-amber-600 flex-shrink-0" />
                    3 items require your attention
                  </span>
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-0.5">
                  Further Information Request — Cork City Council
                </h3>
                <p className="text-xs text-gray-400 mb-4">Reference: PL04B/2025/1205 · Received 22 March 2026</p>
                <div className="space-y-3">
                  {[
                    {
                      priority: "High",
                      priorityClass: "bg-red-100 text-red-700",
                      title: "Updated drainage report required",
                      detail: "A percolation test report meeting EPA guidelines must be submitted. The existing report is over 12 months old and cannot be relied on.",
                    },
                    {
                      priority: "Medium",
                      priorityClass: "bg-amber-100 text-amber-700",
                      title: "Site boundary clarification",
                      detail: "The south-eastern corner of the site boundary does not match the site notice. An updated site map must be lodged.",
                    },
                    {
                      priority: "Medium",
                      priorityClass: "bg-amber-100 text-amber-700",
                      title: "Road widening strip dedication",
                      detail: "A 2m strip along the road frontage must be ceded to Cork City Council. A solicitor&apos;s undertaking is required.",
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className={`mt-0.5 text-xs font-bold px-2 py-0.5 rounded-md whitespace-nowrap ${item.priorityClass}`}>
                        {item.priority}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────── */}
      <section id="features" className="border-t border-gray-100 py-14 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-gray-900">
            Everything you need to navigate Irish planning
          </h2>
          <p className="text-gray-500 text-center mb-10 sm:mb-14 text-sm sm:text-base">
            From exemption checks to full application guidance — all in one place.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {[
              {
                icon: "✓",
                title: "Permission Checker",
                description:
                  "Find out instantly if your project qualifies as exempt development under the Planning & Development Act.",
                href: "/check",
              },
              {
                icon: "◉",
                title: "Application Status",
                description:
                  "Track your planning application through all 8 stages of the Irish process with plain English explanations.",
                href: "/status",
              },
              {
                icon: "↗",
                title: "Document Interpreter",
                description:
                  "Upload an RFI, planning conditions, or appeal decision and get a clear breakdown with prioritised actions.",
                href: "/interpreter",
              },
              {
                icon: "☑",
                title: "Document Checklist",
                description:
                  "Generate a complete submission checklist for your application type and county — never miss a required document.",
                href: "/checklist",
              },
            ].map((f) => (
              <Link
                key={f.title}
                href={f.href}
                className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-green-300 hover:shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-lg bg-green-50 text-green-600 flex items-center justify-center text-sm font-bold mb-4">
                  {f.icon}
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────── */}
      <section id="how-it-works" className="border-t border-gray-100 py-14 sm:py-20 lg:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-gray-900">
            How it works
          </h2>
          <p className="text-gray-500 text-center mb-10 sm:mb-14 text-sm sm:text-base">
            Three steps to a clear planning answer.
          </p>
          <ol className="space-y-8 sm:space-y-10">
            {[
              {
                step: "01",
                title: "Describe your project",
                body: "Select your county, project type, and size. Add any extra context that might be relevant.",
              },
              {
                step: "02",
                title: "We check the regulations",
                body: "Granted checks your project against the Planning & Development Acts and the latest exemption rules for your county.",
              },
              {
                step: "03",
                title: "Get a clear answer",
                body: "Receive a plain-English result — Exempt, Likely Needs Permission, or Definitely Needs Permission — with a full explanation.",
              },
            ].map((item) => (
              <li key={item.step} className="flex gap-5 sm:gap-6 items-start">
                <span className="flex-shrink-0 text-2xl sm:text-3xl font-bold text-green-200 w-10 sm:w-12 text-right leading-none pt-1">
                  {item.step}
                </span>
                <div className="border-l border-gray-200 pl-5 sm:pl-6 flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 sm:mt-16 text-center">
            <Link
              href="/check"
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-8 sm:px-10 py-3.5 rounded-xl text-base sm:text-lg font-semibold transition-colors"
            >
              Check my project now
            </Link>
          </div>
        </div>
      </section>

      {/* ── AI Transparency Notice (EU AI Act) ───────────────── */}
      <section className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.315 2.798H4.113c-1.345 0-2.315-1.798-1.315-2.798L4.2 15.3" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">
                AI-generated information
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Granted uses artificial intelligence to analyse your project against Irish planning
                regulations. All outputs are AI-generated guidance only and may not be accurate,
                complete, or applicable to your specific circumstances.{" "}
                <strong className="font-medium text-gray-700">
                  Granted is not a planning consultant, architect, or legal adviser
                </strong>{" "}
                and nothing on this site constitutes professional advice. You should always verify
                results with your local planning authority or a qualified planning professional
                before making decisions with legal or financial consequences.
              </p>
              <p className="text-xs text-gray-400 mt-2">
                This notice is provided in accordance with the EU Artificial Intelligence Act (Regulation (EU) 2024/1689).{" "}
                <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 transition-colors">Terms of Service</Link>
                {" "}·{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 transition-colors">Privacy Policy</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />

    </main>
  );
}
