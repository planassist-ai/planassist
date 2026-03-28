import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service — PlanAssist",
  description:
    "Terms and conditions for using PlanAssist. PlanAssist provides planning information only and is not a substitute for professional planning advice.",
};

const SECTIONS = [
  { id: "about",           label: "About PlanAssist" },
  { id: "information-only", label: "Information only" },
  { id: "liability",       label: "Limitation of liability" },
  { id: "acceptable-use",  label: "Acceptable use" },
  { id: "account",         label: "Your account" },
  { id: "ip",              label: "Intellectual property" },
  { id: "termination",     label: "Termination" },
  { id: "governing-law",   label: "Governing law" },
  { id: "changes",         label: "Changes to these terms" },
  { id: "contact",         label: "Contact" },
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

export default function TermsPage() {
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
                href="/privacy"
                className="block text-sm text-green-600 hover:text-green-700"
              >
                Privacy Policy →
              </Link>
            </div>
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────── */}
        <main className="flex-1 min-w-0">
          <BackLink />

          <h1 className="text-3xl font-bold text-gray-900 mb-1">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-2">Last updated: 28 March 2026</p>
          <p className="text-sm text-gray-500 mb-8">
            By using PlanAssist you agree to these terms. Please read them carefully.
          </p>

          {/* ── Prominent disclaimer ──────────────────────────── */}
          <div className="mb-10 rounded-2xl border-2 border-amber-200 bg-amber-50 p-5">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-amber-600 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.75}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <div>
                <p className="font-semibold text-amber-900 mb-1">
                  PlanAssist provides information only — not professional advice
                </p>
                <p className="text-amber-800 text-sm leading-relaxed">
                  Nothing on PlanAssist constitutes professional planning, legal, architectural, or
                  engineering advice. Output from the service is for general informational purposes
                  only. You must not rely solely on PlanAssist when making planning decisions.
                  Always consult a qualified planning professional before submitting a planning
                  application or making decisions with legal or financial consequences.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-gray-700">

            {/* 1 — About */}
            <section>
              <SectionAnchor id="about" />
              <H2>1. About PlanAssist</H2>
              <p>
                PlanAssist is an AI-powered planning assistance service for Ireland that helps
                users understand planning requirements, interpret planning documents, monitor
                planning applications, and prepare for the planning process.
              </p>
              <p className="mt-2">
                These Terms of Service (&ldquo;Terms&rdquo;) govern your use of PlanAssist. By
                creating an account or using the service you confirm that you have read, understood,
                and agree to be bound by these Terms and our{" "}
                <Link href="/privacy" className="text-green-600 underline underline-offset-2 hover:text-green-700">
                  Privacy Policy
                </Link>
                .
              </p>
            </section>

            <Divider />

            {/* 2 — Information only */}
            <section>
              <SectionAnchor id="information-only" />
              <H2>2. Information only — not professional advice</H2>
              <p className="mb-3">
                PlanAssist uses artificial intelligence to provide general planning information and
                guidance. The service:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  Does <strong>not</strong> constitute professional planning, legal, architectural,
                  or engineering advice.
                </li>
                <li>
                  Cannot guarantee that AI-generated guidance is accurate, complete, current, or
                  applicable to your specific circumstances.
                </li>
                <li>
                  Does not create a professional-client relationship of any kind between you and
                  PlanAssist.
                </li>
                <li>
                  Should not be used as the sole basis for submitting a planning application or
                  making any decision with legal, financial, or regulatory consequences.
                </li>
              </ul>
              <p>
                Planning law and local development plans change regularly. You are responsible for
                verifying all information with the relevant local authority and with a suitably
                qualified planning professional.
              </p>
            </section>

            <Divider />

            {/* 3 — Limitation of liability */}
            <section>
              <SectionAnchor id="liability" />
              <H2>3. Limitation of liability</H2>

              <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-4 mb-5 text-xs font-mono text-gray-600 leading-relaxed uppercase tracking-wide">
                Important legal notice — please read carefully
              </div>

              <p className="mb-3">
                <strong>3.1 No warranties.</strong> PlanAssist is provided &ldquo;as is&rdquo; and
                &ldquo;as available&rdquo; without warranty of any kind, express or implied,
                including but not limited to warranties of merchantability, fitness for a particular
                purpose, accuracy, or non-infringement. We do not warrant that the service will be
                uninterrupted, error-free, or free from harmful components.
              </p>

              <p className="mb-3">
                <strong>3.2 Exclusion of liability for planning decisions.</strong> To the maximum
                extent permitted by Irish and EU law, PlanAssist and its operators, directors,
                employees, and agents shall not be liable for any loss, damage, cost, or expense —
                whether direct, indirect, incidental, special, consequential, or exemplary —
                arising from or in connection with:
              </p>
              <ul className="list-disc pl-5 space-y-2 mb-4">
                <li>
                  Any planning decision, application outcome, or enforcement action arising from
                  reliance on information or guidance provided by the service;
                </li>
                <li>
                  Errors, omissions, or inaccuracies in AI-generated content;
                </li>
                <li>
                  Delays, rejections, conditions, or refusals of planning permission;
                </li>
                <li>
                  Any financial loss, loss of property value, or loss of development opportunity;
                </li>
                <li>
                  Reliance on the service without obtaining independent professional advice.
                </li>
              </ul>

              <p className="mb-3">
                <strong>3.3 Cap on liability.</strong> Where liability cannot be fully excluded
                under applicable law, our total aggregate liability to you for any and all claims
                arising from or relating to the service shall not exceed the total fees you have
                paid to PlanAssist in the twelve months immediately preceding the claim.
              </p>

              <p className="mb-3">
                <strong>3.4 Consumer rights.</strong> Nothing in these Terms limits or excludes
                any rights you have under Irish or EU consumer protection law that cannot lawfully
                be limited, including rights under the Consumer Rights Act 2022 and the Sale of
                Goods and Supply of Services Act 1980, to the extent applicable.
              </p>

              <p>
                <strong>3.5 Your responsibility.</strong> You accept full responsibility for any
                decisions you make based on information provided by PlanAssist. We strongly
                recommend engaging a registered planning consultant, architect, or solicitor before
                submitting any planning application.
              </p>
            </section>

            <Divider />

            {/* 4 — Acceptable use */}
            <section>
              <SectionAnchor id="acceptable-use" />
              <H2>4. Acceptable use</H2>
              <p className="mb-3">You agree not to use PlanAssist to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide false, misleading, or fraudulent information.</li>
                <li>
                  Attempt to reverse-engineer, scrape, or systematically extract data from the
                  service.
                </li>
                <li>
                  Submit queries or documents that infringe the intellectual property rights of
                  third parties.
                </li>
                <li>
                  Use the service for any unlawful purpose or in violation of any applicable
                  regulation.
                </li>
                <li>
                  Attempt to circumvent rate limits, security measures, or access controls.
                </li>
                <li>
                  Resell, sublicense, or otherwise commercially exploit outputs from the service
                  without our prior written consent.
                </li>
              </ul>
            </section>

            <Divider />

            {/* 5 — Account */}
            <section>
              <SectionAnchor id="account" />
              <H2>5. Your account</H2>
              <p className="mb-3">
                You are responsible for maintaining the confidentiality of your account credentials
                and for all activity that occurs under your account.
              </p>
              <p className="mb-3">
                You must notify us immediately at{" "}
                <a
                  href="mailto:hello@planassist.ie"
                  className="text-green-600 underline underline-offset-2 hover:text-green-700"
                >
                  hello@planassist.ie
                </a>{" "}
                if you suspect unauthorised access to your account.
              </p>
              <p>
                We reserve the right to suspend or terminate accounts that violate these Terms or
                that we reasonably believe are being used for abusive or unlawful purposes.
              </p>
            </section>

            <Divider />

            {/* 6 — IP */}
            <section>
              <SectionAnchor id="ip" />
              <H2>6. Intellectual property</H2>
              <p className="mb-3">
                The PlanAssist platform, brand, software, and AI-generated outputs are owned by or
                licensed to PlanAssist. You are granted a limited, non-exclusive, non-transferable
                licence to use the service for its intended purpose.
              </p>
              <p>
                You retain ownership of any content (documents, queries) you submit to the service.
                By submitting content you grant us a limited licence to process it solely for the
                purpose of providing the service to you.
              </p>
            </section>

            <Divider />

            {/* 7 — Termination */}
            <section>
              <SectionAnchor id="termination" />
              <H2>7. Termination</H2>
              <p className="mb-3">
                You may stop using PlanAssist at any time. To delete your account and request
                erasure of your data, email{" "}
                <a
                  href="mailto:hello@planassist.ie"
                  className="text-green-600 underline underline-offset-2 hover:text-green-700"
                >
                  hello@planassist.ie
                </a>
                .
              </p>
              <p>
                We may suspend or terminate your access without notice if you breach these Terms or
                if we are required to do so by law. Sections 3 (Limitation of Liability),
                6 (Intellectual Property), and 8 (Governing Law) survive termination.
              </p>
            </section>

            <Divider />

            {/* 8 — Governing law */}
            <section>
              <SectionAnchor id="governing-law" />
              <H2>8. Governing law</H2>
              <p className="mb-3">
                These Terms are governed by and construed in accordance with the laws of Ireland.
                Any dispute arising out of or relating to these Terms or your use of PlanAssist
                shall be subject to the exclusive jurisdiction of the courts of Ireland.
              </p>
              <p>
                If you are a consumer resident in another EU member state, you may also have
                recourse to the dispute resolution bodies in your country of residence under
                applicable EU consumer law.
              </p>
            </section>

            <Divider />

            {/* 9 — Changes */}
            <section>
              <SectionAnchor id="changes" />
              <H2>9. Changes to these terms</H2>
              <p>
                We may update these Terms from time to time. We will notify you of material changes
                via email or in-app notice at least 14 days before they take effect. Your continued
                use of PlanAssist after that date constitutes acceptance of the revised Terms.
              </p>
            </section>

            <Divider />

            {/* 10 — Contact */}
            <section>
              <SectionAnchor id="contact" />
              <H2>10. Contact</H2>
              <p>
                Questions about these Terms? Email us at{" "}
                <a
                  href="mailto:hello@planassist.ie"
                  className="text-green-600 underline underline-offset-2 hover:text-green-700"
                >
                  hello@planassist.ie
                </a>
                .
              </p>
            </section>

            <div className="pt-4 flex gap-4 text-sm">
              <Link href="/privacy" className="text-green-600 hover:text-green-700">
                Privacy Policy →
              </Link>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
