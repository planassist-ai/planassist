import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — PlanAssist",
  description:
    "How PlanAssist collects, uses, and protects your personal data and cookies.",
};

export default function PrivacyPage() {
  return (
    <main className="max-w-3xl mx-auto px-5 py-12 sm:px-6 sm:py-16">

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

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-500 mb-10">Last updated: March 2025</p>

      <div className="prose prose-gray max-w-none space-y-8 text-sm leading-relaxed text-gray-700">

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Who we are</h2>
          <p>
            PlanAssist is an AI-powered planning permission guidance tool for Ireland. We help
            architects, homeowners, and developers understand planning requirements and interpret
            planning documents.
          </p>
          <p className="mt-2">
            If you have any questions about this policy or how we handle your data, please contact
            us at{" "}
            <a
              href="mailto:hello@planassist.ie"
              className="text-green-600 underline underline-offset-2 hover:text-green-700"
            >
              hello@planassist.ie
            </a>
            .
          </p>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">What data we collect</h2>
          <p className="mb-3">We collect and process the following personal data:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Account information</strong> — your email address when you sign up or log in.
            </li>
            <li>
              <strong>Usage data</strong> — the planning queries you submit, documents you upload,
              and features you use. This is used to provide the service and improve it.
            </li>
            <li>
              <strong>Technical data</strong> — your IP address, browser type, and device
              information collected automatically when you use the service.
            </li>
          </ul>
          <p className="mt-3">
            We do not sell your personal data to third parties.
          </p>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Cookies</h2>
          <p className="mb-4">
            Cookies are small text files stored in your browser. We use them to keep the service
            working and, with your consent, to understand how people use PlanAssist.
          </p>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Cookie</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-700">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">sb-*</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      Necessary
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    Keeps you signed in. Set by Supabase, our authentication provider.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">planassist_cookie_consent</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                      Necessary
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    Remembers your cookie preferences so we don&apos;t ask you again.
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">Analytics</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                      Analytics
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    Helps us understand how the app is used so we can improve it. Only set if you
                    choose &ldquo;Accept all&rdquo;.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Your cookie choices</h2>
          <p className="mb-3">
            When you first visit PlanAssist you are shown a cookie banner where you can choose:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Accept all</strong> — enables both necessary and analytics cookies.
            </li>
            <li>
              <strong>Necessary only</strong> — only the cookies required for the service to work
              are set. Analytics are disabled.
            </li>
          </ul>
          <p className="mt-3">
            To change your preference at any time, clear your browser&apos;s local storage for this
            site — the banner will reappear on your next visit.
          </p>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Legal basis for processing</h2>
          <p>
            We process your data on the following legal bases under GDPR:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3">
            <li>
              <strong>Contract</strong> — processing necessary to provide the service you signed up
              for.
            </li>
            <li>
              <strong>Legitimate interests</strong> — keeping the service secure and preventing
              fraud.
            </li>
            <li>
              <strong>Consent</strong> — analytics cookies, which you can withdraw at any time.
            </li>
          </ul>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Data retention</h2>
          <p>
            We retain your account data for as long as your account is active. If you delete your
            account, your personal data is removed within 30 days. Anonymised usage data may be
            retained for longer for analytics purposes.
          </p>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Third-party services</h2>
          <p className="mb-3">We use the following third-party services to run PlanAssist:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Supabase</strong> — authentication and database (EU data residency).
            </li>
            <li>
              <strong>Anthropic</strong> — AI analysis of planning queries and documents.
            </li>
            <li>
              <strong>Resend</strong> — transactional email (e.g. sign-in links).
            </li>
          </ul>
          <p className="mt-3">
            Each provider is bound by appropriate data processing agreements.
          </p>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Your rights</h2>
          <p className="mb-3">Under GDPR you have the right to:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Access the personal data we hold about you.</li>
            <li>Correct inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Object to or restrict how we process your data.</li>
            <li>Withdraw consent for analytics at any time.</li>
            <li>Lodge a complaint with the Data Protection Commission (Ireland).</li>
          </ul>
          <p className="mt-3">
            To exercise any of these rights, email us at{" "}
            <a
              href="mailto:hello@planassist.ie"
              className="text-green-600 underline underline-offset-2 hover:text-green-700"
            >
              hello@planassist.ie
            </a>
            .
          </p>
        </section>

        <hr className="border-gray-100" />

        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Changes to this policy</h2>
          <p>
            We may update this policy from time to time. Material changes will be communicated via
            the app or by email. The date at the top of this page shows when it was last updated.
          </p>
        </section>

      </div>
    </main>
  );
}
