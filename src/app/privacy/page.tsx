import type { Metadata } from "next";
import Link from "next/link";
import { DeletionRequestForm } from "@/app/components/DeletionRequestForm";

export const metadata: Metadata = {
  title: "Privacy Policy — PlanAssist",
  description:
    "How PlanAssist collects, uses, and protects your personal data in accordance with GDPR.",
};

const SECTIONS = [
  { id: "who-we-are",        label: "Who we are" },
  { id: "data-collected",    label: "Data we collect" },
  { id: "why-collected",     label: "Why we collect it" },
  { id: "legal-basis",       label: "Legal basis" },
  { id: "data-retention",    label: "Data retention" },
  { id: "data-storage",      label: "Where data is stored" },
  { id: "third-parties",     label: "Third-party processors" },
  { id: "cookies",           label: "Cookies" },
  { id: "your-rights",       label: "Your GDPR rights" },
  { id: "exercise-rights",   label: "Exercising your rights" },
  { id: "data-deletion",     label: "Request data deletion" },
  { id: "complaints",        label: "Complaints" },
  { id: "changes",           label: "Changes to this policy" },
];

function BackLink() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-1.5 text-sm text-green-600 hover:text-green-700 mb-8 group"
    >
      <svg
        className="w-4 h-4 transition-transform group-hover:-translate-x-0.5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
      </svg>
      Back to PlanAssist
    </Link>
  );
}

function SectionAnchor({ id }: { id: string }) {
  return <span id={id} className="-mt-20 pt-20 block" aria-hidden="true" />;
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-lg font-semibold text-gray-900 mb-3">{children}</h2>
  );
}

function Divider() {
  return <hr className="border-gray-100" />;
}

function Badge({ children, variant = "green" }: { children: React.ReactNode; variant?: "green" | "blue" | "amber" }) {
  const styles = {
    green: "bg-green-50 text-green-700",
    blue:  "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
}

export default function PrivacyPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-4xl mx-auto px-5 py-12 sm:px-6 sm:py-16 lg:flex lg:gap-12">

        {/* ── Sticky side nav (desktop) ─────────────────────── */}
        <aside className="hidden lg:block shrink-0 w-52">
          <div className="sticky top-24">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Contents
            </p>
            <nav className="space-y-1">
              {SECTIONS.map(({ id, label }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className="block text-sm text-gray-500 hover:text-green-600 py-0.5 transition-colors"
                >
                  {label}
                </a>
              ))}
            </nav>
            <div className="mt-8 pt-6 border-t border-gray-100">
              <Link
                href="/terms"
                className="block text-sm text-green-600 hover:text-green-700"
              >
                Terms of Service →
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          <BackLink />

          <h1 className="text-3xl font-bold text-gray-900 mb-1">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-2">Last updated: 28 March 2026</p>
          <p className="text-sm text-gray-500 mb-10">
            Applies to users in Ireland and the European Union.
          </p>

          <div className="space-y-8 text-sm leading-relaxed text-gray-700">

            {/* 1 — Who we are */}
            <section>
              <SectionAnchor id="who-we-are" />
              <H2>1. Who we are</H2>
              <p>
                PlanAssist is an AI-powered planning assistance service for Ireland, operated as
                the data controller for the purposes of the General Data Protection Regulation
                (GDPR) and the Irish Data Protection Act 2018.
              </p>
              <p className="mt-2">
                <strong>Data controller contact:</strong>{" "}
                <a
                  href="mailto:hello@planassist.ie"
                  className="text-green-600 underline underline-offset-2 hover:text-green-700"
                >
                  hello@planassist.ie
                </a>
              </p>
            </section>

            <Divider />

            {/* 2 — Data collected */}
            <section>
              <SectionAnchor id="data-collected" />
              <H2>2. What data we collect</H2>
              <p className="mb-4">We collect and process the following categories of personal data:</p>

              <div className="rounded-xl border border-gray-200 overflow-hidden mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/3">Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Examples</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-800">Account data</td>
                      <td className="px-4 py-3 text-gray-600">
                        Email address provided when you sign up or log in.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-800">Planning data</td>
                      <td className="px-4 py-3 text-gray-600">
                        Planning reference numbers you submit for monitoring or analysis; project
                        descriptions and queries you enter.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-800">Usage data</td>
                      <td className="px-4 py-3 text-gray-600">
                        Features accessed, queries submitted, documents uploaded, timestamps of
                        activity, and feedback you provide.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-800">Technical data</td>
                      <td className="px-4 py-3 text-gray-600">
                        IP address, browser type, device type, and session identifiers. Collected
                        automatically when you use the service.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-gray-600">
                We do not collect special category data (e.g. health, financial, or political data)
                and we do not sell your personal data to any third party.
              </p>
            </section>

            <Divider />

            {/* 3 — Why collected */}
            <section>
              <SectionAnchor id="why-collected" />
              <H2>3. Why we collect it</H2>
              <p className="mb-3">
                We collect and process your personal data solely to provide and improve the
                PlanAssist service. Specifically:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>To operate the service</strong> — authenticating your account, storing
                  your planning reference numbers, and returning AI-assisted planning guidance.
                </li>
                <li>
                  <strong>To monitor planning applications</strong> — using planning reference
                  numbers you submit to check application status on your behalf.
                </li>
                <li>
                  <strong>To send service communications</strong> — sign-in links, application
                  status updates, and critical service notices via email.
                </li>
                <li>
                  <strong>To improve the service</strong> — analysing anonymised usage patterns
                  to identify areas for improvement.
                </li>
                <li>
                  <strong>To ensure security</strong> — rate limiting, abuse prevention, and
                  fraud detection.
                </li>
              </ul>
            </section>

            <Divider />

            {/* 4 — Legal basis */}
            <section>
              <SectionAnchor id="legal-basis" />
              <H2>4. Legal basis for processing</H2>
              <p className="mb-4">
                We rely on the following lawful bases under Article 6 GDPR:
              </p>
              <div className="space-y-3">
                <div className="flex gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                  <div className="shrink-0 w-24 font-semibold text-green-800 text-xs uppercase tracking-wide pt-0.5">
                    Contract
                  </div>
                  <p className="text-green-900 text-sm">
                    Processing your email address and planning data is necessary to provide the
                    service you signed up for (Art. 6(1)(b)).
                  </p>
                </div>
                <div className="flex gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="shrink-0 w-24 font-semibold text-blue-800 text-xs uppercase tracking-wide pt-0.5">
                    Legitimate interest
                  </div>
                  <p className="text-blue-900 text-sm">
                    Security monitoring, abuse prevention, and service improvement based on
                    anonymised usage data (Art. 6(1)(f)). You may object to this processing at
                    any time.
                  </p>
                </div>
                <div className="flex gap-3 p-4 rounded-xl bg-amber-50 border border-amber-100">
                  <div className="shrink-0 w-24 font-semibold text-amber-800 text-xs uppercase tracking-wide pt-0.5">
                    Consent
                  </div>
                  <p className="text-amber-900 text-sm">
                    Analytics cookies, where you have opted in via the cookie banner (Art. 6(1)(a)).
                    You may withdraw consent at any time without affecting lawfulness of prior
                    processing.
                  </p>
                </div>
              </div>
            </section>

            <Divider />

            {/* 5 — Retention */}
            <section>
              <SectionAnchor id="data-retention" />
              <H2>5. Data retention</H2>
              <p className="mb-4">
                We retain personal data only as long as necessary for the purposes set out in this
                policy:
              </p>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 w-1/2">Data type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Retention period</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 text-gray-800">Active account data (email, profile)</td>
                      <td className="px-4 py-3 text-gray-600">Retained while account is active</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-800">Planning monitoring sign-ups</td>
                      <td className="px-4 py-3 text-gray-600">
                        Deleted <strong>12 months after last activity</strong> on the associated account
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-800">User feedback and ratings</td>
                      <td className="px-4 py-3 text-gray-600">
                        Anonymised after <strong>6 months</strong>; anonymised data may be retained
                        indefinitely for service improvement
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-800">Account data on deletion</td>
                      <td className="px-4 py-3 text-gray-600">Purged within 30 days of account deletion request</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-gray-800">Server/security logs</td>
                      <td className="px-4 py-3 text-gray-600">Up to 90 days</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <Divider />

            {/* 6 — Storage */}
            <section>
              <SectionAnchor id="data-storage" />
              <H2>6. Where your data is stored</H2>
              <p className="mb-3">
                All personal data processed by PlanAssist is stored exclusively on servers located
                within the European Union:
              </p>
              <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
                <svg
                  className="w-5 h-5 text-green-600 shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.75}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-green-900 text-sm">
                  Our primary database and authentication service (Supabase) operates in the{" "}
                  <strong>EU West (Ireland) region</strong>. No personal data is transferred
                  outside the EEA without appropriate safeguards.
                </p>
              </div>
              <p className="mt-3">
                Planning queries are processed by Anthropic&apos;s API (see Section 7). Anthropic
                operates under Standard Contractual Clauses for international transfers in
                compliance with GDPR Chapter V.
              </p>
            </section>

            <Divider />

            {/* 7 — Third parties */}
            <section>
              <SectionAnchor id="third-parties" />
              <H2>7. Third-party data processors</H2>
              <p className="mb-4">
                We share your data with the following processors solely to operate the service.
                Each is bound by a Data Processing Agreement:
              </p>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900">Supabase</p>
                    <Badge>Authentication &amp; database</Badge>
                  </div>
                  <p className="text-gray-600">
                    Stores your account details, planning data, and session tokens. Data hosted
                    in EU West (Ireland).
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900">Anthropic</p>
                    <Badge variant="blue">AI processing</Badge>
                  </div>
                  <p className="text-gray-600">
                    Planning queries and uploaded documents are sent to Anthropic&apos;s Claude API
                    for AI analysis. Anthropic does not use your data to train models under their
                    API terms. See{" "}
                    <a
                      href="https://www.anthropic.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 underline underline-offset-2 hover:text-green-700"
                    >
                      Anthropic&apos;s Privacy Policy
                    </a>
                    {" "}for details.
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-gray-900">Resend</p>
                    <Badge>Transactional email</Badge>
                  </div>
                  <p className="text-gray-600">
                    Sends sign-in links and application status notifications to your email address.
                  </p>
                </div>
              </div>
            </section>

            <Divider />

            {/* 8 — Cookies */}
            <section>
              <SectionAnchor id="cookies" />
              <H2>8. Cookies</H2>
              <p className="mb-4">
                Cookies are small text files placed in your browser. We use them to keep the
                service working and, with your consent, to understand how PlanAssist is used.
              </p>

              <div className="rounded-xl border border-gray-200 overflow-hidden mb-5">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Purpose</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">sb-*</td>
                      <td className="px-4 py-3">
                        <Badge>Necessary</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        Keeps you signed in. Set by Supabase, our authentication provider.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">planassist_cookie_consent</td>
                      <td className="px-4 py-3">
                        <Badge>Necessary</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        Stores your cookie preference in localStorage so we do not ask again.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">Analytics cookies</td>
                      <td className="px-4 py-3">
                        <Badge variant="blue">Analytics</Badge>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        Help us understand how the app is used so we can improve it. Only set if
                        you choose &ldquo;Accept all&rdquo; in the cookie banner.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="mb-2 font-medium text-gray-800">Managing your cookie preferences</p>
              <p className="mb-2">
                On your first visit you will see a cookie banner where you can choose{" "}
                <strong>Accept all</strong> or <strong>Necessary only</strong>.
              </p>
              <p>
                To change your preference at any time, clear this site&apos;s localStorage in your
                browser settings — the banner will reappear on your next visit.
              </p>
            </section>

            <Divider />

            {/* 9 — Your rights */}
            <section>
              <SectionAnchor id="your-rights" />
              <H2>9. Your rights under GDPR</H2>
              <p className="mb-4">
                As a data subject under the GDPR you have the following rights:
              </p>
              <div className="space-y-2">
                {[
                  {
                    right: "Right of access (Art. 15)",
                    desc: "Obtain a copy of the personal data we hold about you.",
                  },
                  {
                    right: "Right to rectification (Art. 16)",
                    desc: "Have inaccurate or incomplete data corrected.",
                  },
                  {
                    right: "Right to erasure (Art. 17)",
                    desc: 'Have your personal data deleted (&ldquo;right to be forgotten&rdquo;), subject to legal retention obligations.',
                  },
                  {
                    right: "Right to data portability (Art. 20)",
                    desc: "Receive your data in a structured, machine-readable format (applies to data processed by automated means on the basis of consent or contract).",
                  },
                  {
                    right: "Right to restrict processing (Art. 18)",
                    desc: "Ask us to pause processing your data in certain circumstances.",
                  },
                  {
                    right: "Right to object (Art. 21)",
                    desc: "Object to processing based on legitimate interests at any time.",
                  },
                  {
                    right: "Right to withdraw consent",
                    desc: "Withdraw consent for analytics cookies at any time without affecting prior lawful processing.",
                  },
                ].map(({ right, desc }) => (
                  <div key={right} className="flex gap-3 py-2.5 border-b border-gray-100 last:border-0">
                    <svg
                      className="w-4 h-4 text-green-500 shrink-0 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-900">{right}</p>
                      <p
                        className="text-gray-600 mt-0.5"
                        dangerouslySetInnerHTML={{ __html: desc }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <Divider />

            {/* 10 — Exercising rights */}
            <section>
              <SectionAnchor id="exercise-rights" />
              <H2>10. How to exercise your rights</H2>
              <p className="mb-3">
                To make a data subject request, email us at{" "}
                <a
                  href="mailto:hello@planassist.ie"
                  className="text-green-600 underline underline-offset-2 hover:text-green-700"
                >
                  hello@planassist.ie
                </a>{" "}
                with the subject line <strong>&ldquo;Data Request&rdquo;</strong>. Please include
                your registered email address so we can verify your identity.
              </p>
              <p>
                We will respond within <strong>30 days</strong> as required by GDPR. Complex
                requests may be extended by a further two months, in which case we will notify you.
              </p>
            </section>

            <Divider />

            {/* 11 — Data deletion request */}
            <section>
              <SectionAnchor id="data-deletion" />
              <H2>11. Request deletion of your data</H2>
              <p className="mb-3">
                Under GDPR Article 17 you have the right to request that we delete all personal
                data we hold about you. Use the form below to submit a deletion request. We will
                process it within <strong>30 days</strong> and send you a confirmation email.
              </p>
              <p className="mb-5 text-gray-600">
                Deletion will remove your account, planning queries, monitoring sign-ups, and any
                other data associated with your email address. Data we are legally required to
                retain (e.g. for fraud prevention) will be anonymised rather than deleted.
              </p>
              <DeletionRequestForm />
            </section>

            <Divider />

            {/* 12 — Complaints */}
            <section>
              <SectionAnchor id="complaints" />
              <H2>12. Complaints</H2>
              <p className="mb-3">
                If you are unhappy with how we handle your personal data, please contact us first
                and we will do our best to resolve the matter.
              </p>
              <p>
                You also have the right to lodge a complaint with the supervisory authority in
                Ireland:
              </p>
              <div className="mt-3 p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700">
                <p className="font-semibold text-gray-900 mb-1">Data Protection Commission</p>
                <p>21 Fitzwilliam Square South, Dublin 2, D02 RD28</p>
                <p>
                  <a
                    href="https://www.dataprotection.ie"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-600 underline underline-offset-2 hover:text-green-700"
                  >
                    www.dataprotection.ie
                  </a>
                </p>
              </div>
            </section>

            <Divider />

            {/* 12 — Changes */}
            <section>
              <SectionAnchor id="changes" />
              <H2>13. Changes to this policy</H2>
              <p>
                We may update this policy from time to time. Material changes will be communicated
                in-app or by email before they take effect. The date at the top of this page shows
                when it was last revised.
              </p>
            </section>

            <div className="pt-4 flex gap-4 text-sm">
              <Link href="/terms" className="text-green-600 hover:text-green-700">
                Terms of Service →
              </Link>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
