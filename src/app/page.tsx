import Link from "next/link";
import { HomeNav } from "@/app/components/HomeNav";

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
          PlanAssist uses AI to analyse your project against Irish planning regulations —
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
                body: "PlanAssist checks your project against the Planning & Development Acts and the latest exemption rules.",
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

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 px-4 sm:px-6 py-8 text-center text-xs sm:text-sm text-gray-400">
        <p>
          &copy; {new Date().getFullYear()} PlanAssist &mdash; Guidance only. Not a substitute for
          professional planning advice.
        </p>
      </footer>

    </main>
  );
}
