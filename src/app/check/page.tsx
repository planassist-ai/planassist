"use client";

import { useState } from "react";
import type { CheckPermissionResult } from "@/app/api/check-permission/route";
import { AppShell } from "@/app/components/AppShell";

const COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin",
  "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim",
  "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan",
  "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford",
  "Westmeath", "Wexford", "Wicklow",
];

const PROJECT_TYPES = [
  "Rear Extension",
  "Side Extension",
  "Attic Conversion",
  "New Build",
  "Garden Room",
  "Garage Conversion",
  "Change of Use",
  "Other",
];

const OUTCOME_CONFIG = {
  EXEMPT: {
    label: "Exempt",
    badge: "bg-green-100 text-green-700 border border-green-200",
    dot: "bg-green-600",
    card: "border-green-200 bg-green-50",
    heading: "text-green-700",
    bullet: "bg-green-600",
    note: "bg-green-100 border-green-200 text-green-700",
    bodyText: "text-green-900",
  },
  LIKELY_NEEDS_PERMISSION: {
    label: "Likely Needs Permission",
    badge: "bg-amber-100 text-amber-700 border border-amber-200",
    dot: "bg-amber-600",
    card: "border-amber-200 bg-amber-50",
    heading: "text-amber-700",
    bullet: "bg-amber-600",
    note: "bg-amber-100 border-amber-200 text-amber-700",
    bodyText: "text-amber-900",
  },
  DEFINITELY_NEEDS_PERMISSION: {
    label: "Needs Permission",
    badge: "bg-red-100 text-red-700 border border-red-200",
    dot: "bg-red-600",
    card: "border-red-200 bg-red-50",
    heading: "text-red-700",
    bullet: "bg-red-600",
    note: "bg-red-100 border-red-200 text-red-700",
    bodyText: "text-red-900",
  },
} as const;

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

const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const inputClass =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";

export default function CheckPage() {
  const [county, setCounty] = useState("");
  const [projectType, setProjectType] = useState("");
  const [size, setSize] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckPermissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/check-permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ county, projectType, size: Number(size), details }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }

      setResult(data as CheckPermissionResult);
      setTimeout(() => {
        document.getElementById("result")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const config = result ? OUTCOME_CONFIG[result.outcome] : null;

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-7 sm:mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Permission Checker
          </h1>
          <p className="text-gray-500 leading-relaxed text-sm sm:text-base">
            Describe your project and we&apos;ll assess whether planning permission is required under
            current Irish planning law, including the March 2026 exemption changes.
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6 shadow-sm"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
            {/* County */}
            <div>
              <label className={labelClass} htmlFor="county">
                County <span className="text-red-500">*</span>
              </label>
              <select
                id="county"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
                required
                className={inputClass + " appearance-none cursor-pointer"}
              >
                <option value="" disabled>Select a county…</option>
                {COUNTIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Project type */}
            <div>
              <label className={labelClass} htmlFor="projectType">
                Project type <span className="text-red-500">*</span>
              </label>
              <select
                id="projectType"
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                required
                className={inputClass + " appearance-none cursor-pointer"}
              >
                <option value="" disabled>Select a project type…</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className={labelClass} htmlFor="size">
              Size (square metres) <span className="text-red-500">*</span>
            </label>
            <input
              id="size"
              type="number"
              min="1"
              max="10000"
              step="1"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              required
              placeholder="e.g. 25"
              className={inputClass}
            />
          </div>

          {/* Additional details */}
          <div>
            <label className={labelClass} htmlFor="details">
              Additional details{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              placeholder="e.g. Detached house built in 1990, no previous extensions. Rear garden is approx. 80 sqm. Not a protected structure."
              className={inputClass + " resize-none leading-relaxed"}
            />
            <p className="mt-2 text-xs text-gray-400">
              Include house type (detached / semi-detached / terraced), existing extensions, garden
              size, or protected structure status for a more accurate result.
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
                Analysing your project…
              </>
            ) : (
              "Check planning permission"
            )}
          </button>
        </form>

        {/* Error state */}
        {error && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Result */}
        {result && config && (
          <div
            id="result"
            className={`mt-6 sm:mt-8 rounded-2xl border ${config.card} p-5 sm:p-6 lg:p-8`}
          >
            {/* Badge */}
            <div className="mb-4 sm:mb-5">
              <span className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full ${config.badge}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
                {config.label}
              </span>
            </div>

            {/* Headline */}
            <h2 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-5 ${config.heading}`}>
              {result.headline}
            </h2>

            {/* Explanation */}
            <div className={`text-sm leading-relaxed space-y-3 mb-6 sm:mb-7 ${config.bodyText}`}>
              {result.explanation.split("\n\n").map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {/* Key points */}
            {result.keyPoints?.length > 0 && (
              <div className="mb-6 sm:mb-7">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Key factors
                </h3>
                <ul className="space-y-2">
                  {result.keyPoints.map((point, i) => (
                    <li key={i} className={`flex items-start gap-3 text-sm ${config.bodyText}`}>
                      <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${config.bullet}`} />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Caveat */}
            {result.caveat && (
              <div className={`rounded-xl px-4 py-3 text-sm border ${config.note}`}>
                <span className="font-semibold">Note: </span>
                {result.caveat}
              </div>
            )}

            {/* Reset */}
            <button
              onClick={() => {
                setResult(null);
                setError(null);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-5 sm:mt-6 text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
              Check another project
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
            <span className="font-semibold text-gray-600">Guidance only — not legal advice.</span>{" "}
            This tool provides general guidance based on national planning regulations. It is not a
            substitute for advice from a qualified planning consultant, architect, or solicitor.
            Always confirm requirements with your local planning authority before commencing any
            works. Results may vary based on local development plans, protected structure status, and
            site-specific conditions.
          </p>
        </div>

      </div>
    </AppShell>
  );
}
