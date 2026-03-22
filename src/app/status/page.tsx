"use client";

import { useState } from "react";
import type { CheckStatusResult } from "@/app/api/check-status/route";
import { AppShell } from "@/app/components/AppShell";

const COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork City", "Cork County", "Donegal",
  "Dublin City", "Dún Laoghaire-Rathdown", "Fingal", "South Dublin",
  "Galway City", "Galway County", "Kerry", "Kildare", "Kilkenny",
  "Laois", "Leitrim", "Limerick City and County", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo",
  "Tipperary", "Waterford City and County", "Westmeath", "Wexford", "Wicklow",
];

const PLANNING_STAGES = [
  { id: 1, name: "Application Received", brief: "Lodged & reference number assigned" },
  { id: 2, name: "Validation", brief: "Documents checked for completeness" },
  { id: 3, name: "On Public Display", brief: "5-week public consultation period" },
  { id: 4, name: "Under Assessment", brief: "Planning officer reviewing your application" },
  { id: 5, name: "Further Information", brief: "Additional documents requested" },
  { id: 6, name: "Decision Pending", brief: "Recommendation prepared, awaiting sign-off" },
  { id: 7, name: "Decision Issued", brief: "Grant or refusal issued by the council" },
  { id: 8, name: "Appeal Period", brief: "4-week window to appeal to An Bord Pleanála" },
];

function Spinner() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function IconCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

function IconBell({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  );
}

function IconAlert({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
    </svg>
  );
}

const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const inputClass =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";

export default function StatusPage() {
  const [referenceNumber, setReferenceNumber] = useState("");
  const [county, setCounty] = useState("");
  const [statusText, setStatusText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckStatusResult | null>(null);
  const [resultMeta, setResultMeta] = useState<{ ref: string; county: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Monitor state
  const [showMonitor, setShowMonitor] = useState(false);
  const [monitorEmail, setMonitorEmail] = useState("");
  const [monitorLoading, setMonitorLoading] = useState(false);
  const [monitorSuccess, setMonitorSuccess] = useState<string | null>(null);
  const [monitorError, setMonitorError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setResultMeta(null);
    setError(null);
    setShowMonitor(false);
    setMonitorSuccess(null);

    try {
      const res = await fetch("/api/check-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceNumber, county, statusText }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data as CheckStatusResult);
      setResultMeta({ ref: referenceNumber, county });
      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleMonitorSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!resultMeta) return;
    setMonitorLoading(true);
    setMonitorError(null);

    try {
      const res = await fetch("/api/monitor-application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: monitorEmail,
          referenceNumber: resultMeta.ref,
          county: resultMeta.county,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMonitorError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setMonitorSuccess(
        data.alreadyMonitoring
          ? "You're already monitoring this application."
          : "You're all set. We'll email you when the status changes."
      );
      setShowMonitor(false);
    } catch {
      setMonitorError("Network error. Please try again.");
    } finally {
      setMonitorLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-7 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Application Status
          </h1>
          <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
            Enter your planning reference number, council, and the status shown on your council&apos;s
            portal. We&apos;ll translate it into plain English and show you exactly where you are in
            the process.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* Reference number */}
            <div>
              <label className={labelClass} htmlFor="referenceNumber">
                Reference number <span className="text-red-500">*</span>
              </label>
              <input
                id="referenceNumber"
                type="text"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                required
                placeholder="e.g. DCC/2024/000123"
                className={inputClass}
              />
            </div>

            {/* County / Council */}
            <div>
              <label className={labelClass} htmlFor="county">
                Planning authority <span className="text-red-500">*</span>
              </label>
              <select
                id="county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                required
                className={inputClass + " appearance-none cursor-pointer"}
              >
                <option value="" disabled>Select council…</option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status text */}
          <div>
            <label className={labelClass} htmlFor="statusText">
              Current status <span className="text-red-500">*</span>
            </label>
            <input
              id="statusText"
              type="text"
              value={statusText}
              onChange={(e) => setStatusText(e.target.value)}
              required
              placeholder="e.g. Under Assessment, Further Information Requested, Decided…"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-gray-400">
              Copy the exact status text shown on your council&apos;s online planning portal.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm"
          >
            {loading ? (
              <>
                <Spinner />
                Looking up status…
              </>
            ) : (
              "Check application status"
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div id="result" className="mt-6 sm:mt-8 space-y-5 sm:space-y-6">

            {/* Reference pill */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                {resultMeta?.ref}
              </span>
              <span className="text-xs font-medium text-gray-500 bg-gray-100 border border-gray-200 px-3 py-1 rounded-full">
                {resultMeta?.county}
              </span>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-5 sm:mb-6">
                Planning Process — Stage {result.currentStage} of 8
              </h2>
              <ol className="space-y-0">
                {PLANNING_STAGES.map((stage, idx) => {
                  const isCompleted = stage.id < result.currentStage;
                  const isCurrent = stage.id === result.currentStage;
                  const isLast = idx === PLANNING_STAGES.length - 1;

                  return (
                    <li key={stage.id} className="flex gap-3 sm:gap-4">
                      {/* Left column: circle + connector */}
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div
                          className={`relative flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex-shrink-0 transition-all ${
                            isCompleted
                              ? "bg-green-600 border-green-600"
                              : isCurrent
                              ? "bg-green-600 border-green-600 ring-4 ring-green-100"
                              : "bg-white border-gray-200"
                          }`}
                        >
                          {isCompleted ? (
                            <IconCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                          ) : isCurrent ? (
                            <span className="text-white text-xs font-bold">{stage.id}</span>
                          ) : (
                            <span className="text-gray-400 text-xs font-medium">{stage.id}</span>
                          )}
                        </div>
                        {!isLast && (
                          <div
                            className={`w-0.5 flex-1 min-h-[1.75rem] sm:min-h-[2rem] my-1 ${
                              isCompleted ? "bg-green-300" : "bg-gray-200"
                            }`}
                          />
                        )}
                      </div>

                      {/* Right column: content */}
                      <div className={`pb-5 sm:pb-6 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
                        {isCurrent ? (
                          <div className="bg-green-50 border border-green-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 -mt-1">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <p className="text-sm font-semibold text-green-800">{stage.name}</p>
                              <span className="text-xs font-medium text-green-700 bg-green-100 border border-green-200 px-2 py-0.5 rounded-full">
                                Current
                              </span>
                            </div>
                            <p className="text-xs text-green-700">{stage.brief}</p>
                          </div>
                        ) : (
                          <div className="pt-1">
                            <p className={`text-sm font-medium ${isCompleted ? "text-gray-700" : "text-gray-400"}`}>
                              {stage.name}
                            </p>
                            <p className={`text-xs mt-0.5 ${isCompleted ? "text-gray-500" : "text-gray-300"}`}>
                              {stage.brief}
                            </p>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* What this means */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 space-y-5 shadow-sm">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  What this means
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{result.summary}</p>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  What happens next
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{result.whatHappensNext}</p>
              </div>

              <div className="border-t border-gray-100 pt-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Estimated timeframe
                </h2>
                <p className="text-sm text-gray-700 leading-relaxed">{result.estimatedTimeframe}</p>
              </div>
            </div>

            {/* Action required */}
            {result.actionRequired && result.actionDetails && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex gap-3">
                <IconAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 mb-1">Action required</p>
                  <p className="text-sm text-amber-700 leading-relaxed">{result.actionDetails}</p>
                </div>
              </div>
            )}

            {/* Monitor this application */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              {monitorSuccess ? (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <IconCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 mb-0.5">Monitoring active</p>
                    <p className="text-sm text-gray-500">{monitorSuccess}</p>
                  </div>
                </div>
              ) : showMonitor ? (
                <form onSubmit={handleMonitorSubmit} className="space-y-4">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                      <IconBell className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Monitor this application</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Enter your email and we&apos;ll alert you when the status changes.
                      </p>
                    </div>
                  </div>

                  {/* Email + button — stacks on mobile, side by side on sm+ */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={monitorEmail}
                      onChange={(e) => setMonitorEmail(e.target.value)}
                      required
                      placeholder="your@email.com"
                      className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                    />
                    <button
                      type="submit"
                      disabled={monitorLoading}
                      className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-medium text-sm px-5 py-3 sm:py-2.5 rounded-xl transition-colors whitespace-nowrap"
                    >
                      {monitorLoading ? <Spinner /> : null}
                      {monitorLoading ? "Saving…" : "Set up alert"}
                    </button>
                  </div>

                  {monitorError && (
                    <p className="text-sm text-red-600">{monitorError}</p>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowMonitor(false)}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                </form>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                      <IconBell className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Monitor this application</p>
                      <p className="text-sm text-gray-500 mt-0.5">
                        Get an email alert when the status changes.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMonitor(true)}
                    className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white font-medium text-sm px-4 sm:px-5 py-2.5 rounded-xl transition-colors"
                  >
                    Set up alert
                  </button>
                </div>
              )}
            </div>

            {/* Reset */}
            <button
              onClick={() => {
                setResult(null);
                setResultMeta(null);
                setError(null);
                setShowMonitor(false);
                setMonitorSuccess(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              Check another application
            </button>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-6 sm:mt-8 flex gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <svg
            className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
            />
          </svg>
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-600">Guidance only.</span>{" "}
            Status interpretations and timeframes are based on standard Irish planning procedures and
            may not reflect your specific council&apos;s processes. Always check your council&apos;s
            planning portal directly for the authoritative status of your application.
          </p>
        </div>

      </div>
    </AppShell>
  );
}
