"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/AppShell";
import { LegalDisclaimer } from "@/app/components/LegalDisclaimer";
import {
  calculatePlanningFee,
  DEV_TYPES,
  euro,
  type DevTypeKey,
  type FeeResult,
} from "@/lib/planningFee";

export default function FeeCalculatorPage() {
  const [devType, setDevType] = useState<DevTypeKey | "">("");
  const [area, setArea]       = useState("");
  const [result, setResult]   = useState<FeeResult | null>(null);

  const parsedArea  = parseFloat(area);
  const canCalculate =
    devType !== "" && area !== "" && !isNaN(parsedArea) && parsedArea > 0;

  function handleCalculate() {
    if (!canCalculate) return;
    setResult(calculatePlanningFee(devType as DevTypeKey, parsedArea));
  }

  function handleReset() {
    setDevType("");
    setArea("");
    setResult(null);
  }

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-7 sm:mb-9">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
            Planning Fee Calculator
          </h1>
          <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
            Calculate the statutory planning fee for your development based on
            floor area, using Schedule 5 of the Planning &amp; Development
            Regulations 2001 (as amended).
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">

          {/* Development type */}
          <div>
            <label
              htmlFor="dev-type"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Development type <span className="text-red-500">*</span>
            </label>
            <select
              id="dev-type"
              value={devType}
              onChange={(e) => {
                setDevType(e.target.value as DevTypeKey | "");
                setResult(null);
              }}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-colors appearance-none cursor-pointer"
            >
              <option value="" disabled>Select development type…</option>
              {DEV_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {/* Floor area */}
          <div>
            <label
              htmlFor="floor-area"
              className="block text-sm font-medium text-gray-700 mb-1.5"
            >
              Floor area (sq m) <span className="text-red-500">*</span>
            </label>
            <input
              id="floor-area"
              type="number"
              min="1"
              step="0.1"
              value={area}
              onChange={(e) => {
                setArea(e.target.value);
                setResult(null);
              }}
              placeholder="e.g. 40"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none transition-colors"
            />
            <p className="mt-1.5 text-xs text-gray-400">
              Enter the total gross floor area of the proposed development in square metres.
            </p>
          </div>

          {/* Calculate button */}
          <button
            type="button"
            onClick={handleCalculate}
            disabled={!canCalculate}
            className="w-full py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
          >
            Calculate fee
          </button>

          {/* Result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
                Planning fee payable
              </p>
              <p className="text-4xl font-bold text-green-700 mb-4">
                {euro(result.fee)}
              </p>

              <div className="space-y-1.5 mb-4">
                {result.breakdown.map((line, i) => (
                  <p key={i} className="text-sm text-green-800 leading-snug">{line}</p>
                ))}
              </div>

              {result.note && (
                <div className="bg-white/60 rounded-xl px-3.5 py-2.5">
                  <p className="text-xs text-green-700 leading-relaxed">{result.note}</p>
                </div>
              )}

              <p className="mt-4 text-[11px] text-green-600 opacity-70 leading-relaxed">
                Fees are set by the Planning &amp; Development Regulations 2001,
                Schedule 5, as amended. Always verify against the current statutory
                instrument before submission.
              </p>

              <button
                type="button"
                onClick={handleReset}
                className="mt-4 text-xs text-green-700 hover:text-green-900 underline underline-offset-2 transition-colors"
              >
                Calculate another fee
              </button>
            </div>
          )}
        </div>

        <LegalDisclaimer className="mt-6 sm:mt-8" />
      </div>
    </AppShell>
  );
}
