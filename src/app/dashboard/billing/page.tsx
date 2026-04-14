"use client";

import { DashboardShell } from "@/app/components/DashboardShell";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";

export default function BillingPage() {
  const { isArchitect, isPaid, userEmail } = useAuthStatus();

  return (
    <DashboardShell breadcrumb={[{ label: "Billing & Subscription" }]}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Billing &amp; Subscription</h1>
          <p className="text-sm text-gray-500 mt-1">Your current plan and payment information.</p>
        </div>

        {/* Current plan */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-blue-50">
            <h2 className="text-base font-semibold text-blue-900">Current Plan</h2>
          </div>
          <div className="p-6">
            {isArchitect ? (
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-900">Architect Professional</h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">Full pipeline management — unlimited applications, all tools, deadline tracking, and client portal links.</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Billing email</p>
                      <p className="font-medium text-gray-900 truncate">{userEmail}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-500 mb-0.5">Plan</p>
                      <p className="font-medium text-gray-900">Architect Monthly</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : isPaid ? (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Homeowner Access</h3>
                <p className="text-sm text-gray-600">One-off application access active.</p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Free Plan</h3>
                <p className="text-sm text-gray-600">No active subscription.</p>
              </div>
            )}
          </div>
        </div>

        {/* What's included */}
        {isArchitect && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
              <h2 className="text-base font-semibold text-gray-900">What&apos;s Included</h2>
            </div>
            <div className="p-6">
              <ul className="space-y-3">
                {[
                  "Unlimited planning applications in your pipeline",
                  "Document interpreter — RFIs, conditions, appeals decoded",
                  "County intelligence — planning policies for all 31 local authorities",
                  "Application Timeline View with predicted decision dates",
                  "County Deadline Calendar across all live applications",
                  "Client Email Templates library",
                  "Notice generator with statutory wording",
                  "Planning statement generator",
                  "Design guide checker",
                  "Client portal links for each application",
                  "Fee calculator for all development types",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="shrink-0 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                      <svg className="w-3 h-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    </span>
                    <span className="text-sm text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Manage / upgrade */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Manage Your Subscription</h2>
          </div>
          <div className="p-6 space-y-4">
            <p className="text-sm text-gray-600">
              To upgrade, downgrade, cancel, or get a copy of your invoices, contact our team directly and we&apos;ll sort it for you.
            </p>
            <a
              href="mailto:hello@granted.ie?subject=Subscription%20Query"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Contact us — hello@granted.ie
            </a>

            {!isArchitect && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm font-semibold text-blue-900 mb-1">Upgrade to Architect Professional</p>
                <p className="text-sm text-blue-700 mb-3">Get full pipeline management, deadline tracking, and all professional tools.</p>
                <a
                  href="mailto:hello@granted.ie?subject=Architect%20Subscription%20Enquiry"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  Contact us to upgrade
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </DashboardShell>
  );
}
