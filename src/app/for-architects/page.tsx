import Link from "next/link";
import { HomeNav } from "@/app/components/HomeNav";
import { SiteFooter } from "@/app/components/SiteFooter";

// ── Shared helpers ─────────────────────────────────────────────────────────────

function RequestAccessButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/signup?type=architect"
      className={`inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors text-sm sm:text-base ${className}`}
    >
      Request Access
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
      </svg>
    </Link>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ForArchitectsPage() {
  return (
    <main className="min-h-screen bg-white text-gray-900">
      <HomeNav />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-32">
          <span className="inline-flex items-center gap-1.5 bg-blue-900/40 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-700/50 mb-6 sm:mb-8">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
            </svg>
            Built for architects &amp; planning professionals
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 tracking-tight">
            Stop chasing councils.{" "}
            <span className="text-blue-400">Start managing your pipeline.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mb-8 sm:mb-10 leading-relaxed">
            Granted gives Irish architects and planning consultants a single dashboard to track every live application, flag every RFI, update every client, and never miss a statutory deadline — across your entire practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start">
            <RequestAccessButton />
            <a
              href="#tools"
              className="inline-flex items-center justify-center border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-7 py-3.5 rounded-xl text-sm sm:text-base font-medium transition-colors"
            >
              See all tools
            </a>
          </div>
          <p className="mt-5 text-sm text-gray-500">
            30-day free trial available for early practices · No credit card required
          </p>
        </div>
      </section>

      {/* ── Pain ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gray-900 text-white py-14 sm:py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-red-400 uppercase tracking-wide mb-3">Sound familiar?</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-12 leading-snug">
            A week without Granted
          </h2>
          <div className="space-y-0">
            {[
              {
                day: "Mon",
                time: "8:30am",
                text: "You open eleven browser tabs — DCC, Cork City, Galway City, Kildare County, An Bord Pleanála, and six more. Two require a password reset. One portal is down for maintenance. You're now 40 minutes behind before 9am.",
                tone: "red",
              },
              {
                day: "Mon",
                time: "9:45am",
                text: "Your phone rings. A client asking for an update on the Ranelagh extension. You don't have it in front of you. You say you'll call back. You add it to the mental list of things to chase today.",
                tone: "red",
              },
              {
                day: "Tue",
                time: "3:00pm",
                text: "You find an email from Cork City Council that arrived six days ago. An RFI has been issued on the Ballincollig application. The 6-month response clock has been ticking since last Wednesday. You hadn't noticed.",
                tone: "red",
              },
              {
                day: "Wed",
                time: "11:15am",
                text: "You spend 45 minutes manually researching and drafting statutory newspaper notice wording for a new Kerry application. You're not fully confident you have the right approved newspapers for Co. Kerry. You check again. And again.",
                tone: "red",
              },
              {
                day: "Thu",
                time: "2:00pm",
                text: "Three clients have emailed this week asking for updates. You draft each reply from scratch — opening portals, cross-referencing your notes, writing in plain English. This is two hours of your Thursday you won't get back.",
                tone: "red",
              },
              {
                day: "Fri",
                time: "4:30pm",
                text: "A new application comes in. You open a new row in the spreadsheet — the same one you've been maintaining since 2019, now with 47 columns. You type the deadline formula from memory. You hope it's right.",
                tone: "red",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 relative">
                {i < 5 && <div className="absolute left-[27px] top-10 bottom-0 w-px bg-gray-700" />}
                <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                  <div className="w-[54px] text-center text-xs font-bold px-2 py-0.5 rounded-md bg-red-900/60 text-red-300">
                    {item.day}
                  </div>
                  <div className="w-7 h-7 rounded-full bg-red-900/40 border border-red-800/50 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                  </div>
                </div>
                <div className={`flex-1 pb-7 ${i === 5 ? "pb-0" : ""}`}>
                  <p className="text-xs text-gray-500 mb-1">{item.time}</p>
                  <p className="text-sm text-gray-300 leading-relaxed">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 rounded-2xl bg-gray-800 border border-gray-700 px-5 py-4">
            <p className="text-sm text-gray-300 leading-relaxed">
              <strong className="text-white">This is the status quo for most Irish practices.</strong>{" "}
              Multiple portals. A spreadsheet that one person understands. Client calls that interrupt real work.
              An RFI that slips through because it landed in the wrong inbox.
              Granted is built to fix all of it.
            </p>
          </div>
        </div>
      </section>

      {/* ── Week with Granted ─────────────────────────────────────────────────── */}
      <section className="bg-gray-950 text-white py-14 sm:py-20 border-t border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-3">The same week, with Granted</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 sm:mb-12 leading-snug">
            One dashboard. Everything that matters. Nothing missed.
          </h2>
          <div className="space-y-0">
            {[
              {
                day: "Mon",
                time: "8:30am",
                text: "Your Granted dashboard opens. Two applications need attention this week — one is approaching its 8-week validation window, one has an RFI response due in 12 days. Both are flagged clearly. You're across your entire pipeline in 90 seconds.",
                highlight: false,
              },
              {
                day: "Tue",
                time: "11:00am",
                text: "An RFI lands on the Cork application. Granted flags it the moment it's logged — plain-English breakdown of all three items, urgency levels assigned, 6-month deadline calculated automatically. You know exactly what's needed before the client calls.",
                highlight: true,
              },
              {
                day: "Wed",
                time: "2:15pm",
                text: "Three clients get status updates in under two minutes. One click per client — the update is pre-populated from the application record, written in plain English, sent and logged. No email drafting. No copy-paste. Fully audited.",
                highlight: false,
              },
              {
                day: "Thu",
                time: "10:30am",
                text: "The Kerry notice wording is generated in 20 seconds — correct statutory language, correct approved newspapers, correct format for the county. You review, approve, done. The 45 minutes you used to spend is now behind you.",
                highlight: false,
              },
              {
                day: "Fri",
                time: "4:00pm",
                text: "New application added to the dashboard. Submission checklist generated for the project type and county. Statutory deadline calculated. Application appears in the pipeline alongside all existing projects. Spreadsheet untouched.",
                highlight: false,
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 relative">
                {i < 4 && <div className="absolute left-[27px] top-10 bottom-0 w-px bg-gray-700" />}
                <div className="shrink-0 flex flex-col items-center gap-1 pt-1">
                  <div className={`w-[54px] text-center text-xs font-bold px-2 py-0.5 rounded-md ${item.highlight ? "bg-amber-500 text-gray-900" : "bg-blue-900/60 text-blue-300"}`}>
                    {item.day}
                  </div>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center ${item.highlight ? "bg-amber-500" : "bg-blue-900/40 border border-blue-700/50"}`}>
                    <span className={`w-2 h-2 rounded-full ${item.highlight ? "bg-gray-900" : "bg-blue-400"}`} />
                  </div>
                </div>
                <div className={`flex-1 pb-7 ${i === 4 ? "pb-0" : ""}`}>
                  <p className="text-xs text-gray-500 mb-1">{item.time}</p>
                  <p className={`text-sm leading-relaxed ${item.highlight ? "text-white font-medium" : "text-gray-300"}`}>
                    {item.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section id="tools" className="bg-white border-t border-gray-100 py-14 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">What&apos;s included</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 text-gray-900">Every tool your practice needs</h2>
          <p className="text-gray-500 text-sm sm:text-base mb-10 sm:mb-14 max-w-2xl leading-relaxed">
            Purpose-built for Irish planning workflows — not adapted from a generic project management tool.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                title: "Pipeline Dashboard",
                saving: "Replaces the spreadsheet you've been maintaining since 2019",
                desc: "Every live application across your practice in one view — status, statutory deadlines, RFI flags, and next actions. No portal-hopping. No tab management. One screen.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M7.5 13.5l3-3 2.25 2.25L16.5 9" />
                  </svg>
                ),
              },
              {
                title: "Deadline Alerts",
                saving: "Never miss an 8-week validation window or 6-month RFI deadline again",
                desc: "Statutory timelines calculated automatically from submission date. Urgent flags surface days before deadlines become critical — not after the clock has run down.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
              },
              {
                title: "One-Click Client Updates",
                saving: "Eliminates the weekly &#39;any update?&#39; calls and hours of email drafting",
                desc: "Send a plain-English status update directly from the application record. One click — pre-populated, accurate, logged. Each update is auditable and tied to the project.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                ),
              },
              {
                title: "RFI Assistant",
                saving: "Turns a 3-hour document analysis into 20 minutes",
                desc: "Upload any RFI and get an instant plain-English breakdown — items ranked by urgency, deadlines calculated, required actions listed. Never spend an afternoon decoding council letters again.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                ),
              },
              {
                title: "Pre-Submission Validator",
                saving: "Reduces invalid applications and the cost of resubmission",
                desc: "Check your application package against county-specific validation requirements before you lodge. Catch missing documents, incorrect fees, and format issues before they become invalidation letters.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                ),
              },
              {
                title: "Planning Statement Generator",
                saving: "Professional draft in minutes — not hours of blank-page writing",
                desc: "Generate a structured planning statement tailored to the project type, county policy, and local needs criteria. Edit directly in Granted and export when ready. Works across all 26 counties.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                ),
              },
            ].map(({ title, saving, desc, icon }) => (
              <div key={title} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col hover:border-blue-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 mb-4 shrink-0">
                  {icon}
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">{title}</h3>
                <p className="text-xs font-semibold text-blue-600 mb-3 leading-snug">{saving}</p>
                <p className="text-sm text-gray-500 leading-relaxed flex-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonial ──────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-100 py-14 sm:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-8 text-center">What our architects say</p>

          {/* Placeholder testimonial */}
          <div className="relative bg-white border border-blue-100 rounded-2xl p-7 sm:p-8 shadow-sm">
            {/* Placeholder badge */}
            <div className="absolute -top-3 left-6">
              <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-800 border border-yellow-300 text-xs font-semibold px-3 py-1 rounded-full">
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                Placeholder — replace with real testimonial
              </span>
            </div>

            <svg className="w-8 h-8 text-blue-100 mb-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <blockquote className="text-base sm:text-lg text-gray-800 leading-relaxed mb-6 font-medium">
              &ldquo;Before Granted I was managing 14 live applications across 8 councils in a spreadsheet.
              I missed an RFI in Q3 last year and it cost us six weeks on a Kerry project.
              Now everything surfaces in one place and I can see the whole practice in a single view.
              The client update tool alone has saved me the best part of two hours every week.&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-blue-700">EM</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Elaine Murphy</p>
                <p className="text-xs text-gray-500">Principal Architect, Dublin — sole practitioner with 14 active applications</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How onboarding works ─────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-14 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Getting started</p>
          <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-gray-900">Up and running in a day</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "20-minute intro call",
                desc: "We walk through your current workflow, your live applications, and how Granted maps to your practice. No sales deck — just a conversation.",
              },
              {
                step: "02",
                title: "Same-day access",
                desc: "We set up your account, import your active applications, and configure county and deadline settings. You're live the same day.",
              },
              {
                step: "03",
                title: "30-day free trial",
                desc: "Run your practice on Granted for two months before committing. If it doesn't save you time every week, it's not right for you.",
              },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <span className="text-3xl font-bold text-blue-100 leading-none shrink-0 pt-1 w-10 text-right">{item.step}</span>
                <div className="border-l border-gray-200 pl-5">
                  <h3 className="font-semibold text-gray-900 mb-1.5 text-sm sm:text-base">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="bg-gray-950 text-white border-t border-gray-800 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <span className="inline-flex items-center gap-1.5 bg-blue-900/40 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-700/50 mb-6">
            For practices of all sizes across Ireland
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            Ready to run your practice on one screen?
          </h2>
          <p className="text-gray-300 text-base sm:text-lg mb-3 leading-relaxed max-w-xl mx-auto">
            We work with sole practitioners and multi-county studios alike. Get in touch and we&apos;ll find the right setup for your team.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            hello@granted.ie · 30-day free trial available for early practices
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <RequestAccessButton className="text-base" />
            <a
              href="mailto:hello@granted.ie"
              className="inline-flex items-center justify-center border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-7 py-3.5 rounded-xl text-base font-medium transition-colors"
            >
              hello@granted.ie
            </a>
          </div>
          <p className="mt-6 text-xs text-gray-600">
            No pricing shown on this page — we scope plans to the size of your practice.
          </p>
        </div>
      </section>

      <div className="bg-gray-950 border-t border-gray-800">
        <SiteFooter />
      </div>

    </main>
  );
}
