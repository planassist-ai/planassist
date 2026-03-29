import Link from "next/link";
import { HomeNav } from "@/app/components/HomeNav";
import { SiteFooter } from "@/app/components/SiteFooter";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-gray-900">

      <HomeNav />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32 text-center">
        <span className="inline-block bg-green-50 text-green-700 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-full border border-green-200 mb-6 sm:mb-8">
          Built for the Irish planning system
        </span>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-5 sm:mb-6 tracking-tight text-gray-900">
          Do you need planning{" "}
          <span className="text-green-600">permission?</span>
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-500 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Granted uses AI to analyse your project against Irish planning regulations —
          extensions, conversions, new builds, and more — and gives you a clear answer in minutes.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
          <Link
            href="/check"
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3.5 rounded-xl text-base sm:text-lg font-semibold transition-colors"
          >
            Start free assessment
          </Link>
          <a
            href="#how-it-works"
            className="border border-gray-300 hover:border-gray-400 text-gray-600 hover:text-gray-900 px-8 py-3.5 rounded-xl text-base sm:text-lg font-medium transition-colors"
          >
            How it works
          </a>
        </div>
        <p className="mt-8 sm:mt-10 text-xs sm:text-sm text-gray-400">
          Based on the Planning &amp; Development Acts 2000 &amp; 2024 · Updated for March 2026 exemptions
        </p>
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
                title: "AI analyses the regulations",
                body: "Granted checks your project against the Planning & Development Acts and the latest exemption rules.",
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
            {/* Icon */}
            <div className="flex-shrink-0 mt-0.5">
              <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1 1 .03 2.798-1.315 2.798H4.113c-1.345 0-2.315-1.798-1.315-2.798L4.2 15.3"
                  />
                </svg>
              </div>
            </div>

            {/* Text */}
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
                <Link href="/terms" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
                  Terms of Service
                </Link>
                {" "}·{" "}
                <Link href="/privacy" className="underline underline-offset-2 hover:text-gray-600 transition-colors">
                  Privacy Policy
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────── */}
      <SiteFooter />

    </main>
  );
}
