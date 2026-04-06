import Link from "next/link";
import { HomeNav } from "@/app/components/HomeNav";
import { SiteFooter } from "@/app/components/SiteFooter";

export default function ForHomeownersPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <HomeNav />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-green-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <span className="inline-flex items-center gap-1.5 bg-green-500/40 text-green-100 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-400/50 mb-6 sm:mb-8">
            Built for Irish homeowners
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 tracking-tight">
            Planning permission made simple.
          </h1>
          <p className="text-lg sm:text-xl text-green-100 max-w-2xl mb-8 sm:mb-10 leading-relaxed">
            Plain English answers for Irish homeowners.
          </p>
          <Link
            href="/signup?type=homeowner"
            className="inline-flex items-center gap-2 bg-white text-green-700 hover:bg-green-50 font-semibold px-7 py-3.5 rounded-xl text-sm sm:text-base transition-colors"
          >
            Get Started — it&apos;s free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="mt-4 text-sm text-green-200">No account needed to check — sign up to save your results.</p>
        </div>
      </section>

      {/* ── Feature cards ────────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 py-14 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-3 text-gray-900">
            Everything you need in one place
          </h2>
          <p className="text-gray-500 text-center mb-10 sm:mb-14 text-sm sm:text-base">
            From checking if you need permission to understanding every document you receive.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

            {/* Permission Checker */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 flex flex-col hover:border-green-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-5 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Permission Checker</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">
                Find out instantly whether your project — an extension, shed, attic conversion or new build — needs planning permission or qualifies as exempt development under Irish law.
              </p>
              <Link href="/check" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
                Check my project
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Document Interpreter */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 flex flex-col hover:border-green-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-5 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Document Interpreter</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">
                Received a letter from the council? Upload a Further Information Request, planning conditions, or decision notice and get a plain-English breakdown of exactly what it means and what to do next.
              </p>
              <Link href="/interpreter" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
                Interpret a document
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Application Monitoring */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 flex flex-col hover:border-green-300 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 mb-5 shrink-0">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">Application Monitoring</h3>
              <p className="text-sm text-gray-500 leading-relaxed flex-1">
                Already submitted? Track your planning application through every stage of the Irish process — validation, assessment, decision — with plain-English status updates and alerts when anything changes.
              </p>
              <Link href="/status" className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-green-600 hover:text-green-700 transition-colors">
                Track my application
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="border-t border-gray-100 py-14 sm:py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900">
            Ready to get started?
          </h2>
          <p className="text-gray-500 text-sm sm:text-base mb-8 leading-relaxed">
            Create a free account to save your results, track your application, and get notified when your status changes.
          </p>
          <Link
            href="/signup?type=homeowner"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
          >
            Get Started — it&apos;s free
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="mt-4 text-xs text-gray-400">
            Based on the Planning &amp; Development Acts 2000 &amp; 2024 · Updated for March 2026 exemptions
          </p>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
