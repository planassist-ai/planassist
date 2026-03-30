"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────────

type Step = "profession" | "practice" | "welcome" | "checklist";

interface CountyIntelItem {
  type: "critical" | "warning" | "info";
  text: string;
}

interface CountyIntelData {
  levelLabel: string;
  levelColor: "red" | "amber" | "green" | "blue";
  summary: string;
  items: CountyIntelItem[];
}

// ── County intelligence data ───────────────────────────────────────────────────

const COUNTY_INTEL: Record<string, CountyIntelData> = {
  Kildare: {
    levelLabel: "Strict",
    levelColor: "red",
    summary:
      "Kildare is one of Ireland's most restrictive rural housing counties, under intense Dublin commuter pressure. Two county-specific policies override the national rural housing guidelines.",
    items: [
      {
        type: "critical",
        text: "30 dwellings per townland density cap — strictly enforced across all rural areas. Applications that would breach this limit are refused regardless of local connection strength.",
      },
      {
        type: "critical",
        text: "Gap policy — new dwellings must demonstrably fill a genuine gap in the settlement ribbon. Any application that extends ribbon development is refused under the County Development Plan.",
      },
      {
        type: "warning",
        text: "Purchased sites without a demonstrated local housing need or agricultural connection are almost always refused in rural Kildare — advise clients early.",
      },
      {
        type: "info",
        text: "Urban fringe areas around Naas, Newbridge, Maynooth and Celbridge face the tightest controls. Always check the relevant Local Area Plan boundary before pre-planning.",
      },
    ],
  },
  Donegal: {
    levelLabel: "Moderate — second home restrictions apply",
    levelColor: "amber",
    summary:
      "Donegal is broadly permissive for genuine local residents but has county-specific restrictions on second homes and non-resident applications that catch many practitioners out.",
    items: [
      {
        type: "critical",
        text: "Second home restriction — planning permission for new rural dwellings requires proof of a genuine permanent housing need. Holiday home or investment applications are refused as a matter of policy.",
      },
      {
        type: "warning",
        text: "Non-resident applicants face a robust local needs test. A strong verifiable Donegal family connection or a demonstrable functional need to live in the area is required.",
      },
      {
        type: "info",
        text: "Remote and structurally weak rural areas in west Donegal actively welcome genuine rural housing — population retention policies strengthen these applications.",
      },
      {
        type: "info",
        text: "Gaeltacht areas have distinct policies supporting indigenous housing and Irish-speaking communities. Check the specific Gaeltacht Local Area Plan for the site.",
      },
    ],
  },
  Clare: {
    levelLabel: "Mixed — varies sharply by location",
    levelColor: "amber",
    summary:
      "Clare is one of Ireland's most variable counties. The Burren and Atlantic coastline are effectively off-limits for new development. Inland structurally weak areas are permissive.",
    items: [
      {
        type: "critical",
        text: "Burren Special Amenity Area Order (SAAO) — this designation creates a near-complete prohibition on new development. Applications within the SAAO are almost always refused regardless of local connection. Check the SAAO boundary on every rural Clare site.",
      },
      {
        type: "critical",
        text: "Atlantic Coastal Zone — within 300m of the high water mark a Coastal Impact Assessment is mandatory. Permissions in the Loop Head Peninsula, Cliffs of Moher corridor, Kilkee and Doolin coastal areas are rare.",
      },
      {
        type: "warning",
        text: "Liscannor, Lahinch, Ennistymon and the Kilrush coastal areas have additional landscape and heritage protection policies that restrict visual development.",
      },
      {
        type: "info",
        text: "East Clare and structurally weak inland areas operate under a permissive rural housing policy. Local needs criteria are more readily met in these designated zones.",
      },
    ],
  },
};

const GENERIC_INTEL: CountyIntelData = {
  levelLabel: "Full intelligence available",
  levelColor: "green",
  summary:
    "County-specific planning intelligence is loaded for your county — policies, local needs criteria, critical refusal patterns, and key warnings all in one place.",
  items: [
    {
      type: "info",
      text: "County Development Plan analysis — key rural housing policies, density guidelines, and settlement hierarchy for your county.",
    },
    {
      type: "info",
      text: "Local needs test — the exact criteria your county's planners apply, including residency periods, family landholding rules, and functional need definitions.",
    },
    {
      type: "info",
      text: "Critical warnings — known refusal patterns, sensitive landscape designations, Natura 2000 proximity rules, and enforcement hotspots specific to your county.",
    },
    {
      type: "info",
      text: "Case law — recent An Bord Pleanála decisions relevant to your county's planning policy, updated regularly.",
    },
  ],
};

// ── Static data ────────────────────────────────────────────────────────────────

const PROFESSIONS = [
  {
    id: "architect",
    label: "Architect",
    desc: "RIAI-registered architect or architecture practice",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
  },
  {
    id: "planning_consultant",
    label: "Planning Consultant",
    desc: "RTPI/IPI-registered planning consultant",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
      </svg>
    ),
  },
  {
    id: "technologist",
    label: "Architectural Technologist",
    desc: "CIAT-registered architectural technologist",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3" />
      </svg>
    ),
  },
  {
    id: "engineer",
    label: "Engineer",
    desc: "Civil, structural or building services engineer",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L3 3l1.5 1.5 3.75.75 5.91 5.91" />
      </svg>
    ),
  },
  {
    id: "other",
    label: "Other Professional",
    desc: "Land agent, surveyor or other planning professional",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
];

const COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin",
  "Galway", "Kerry", "Kildare", "Kilkenny", "Laois", "Leitrim",
  "Limerick", "Longford", "Louth", "Mayo", "Meath", "Monaghan",
  "Offaly", "Roscommon", "Sligo", "Tipperary", "Waterford",
  "Westmeath", "Wexford", "Wicklow",
];

const FLOW_TYPES = [
  { label: "New Build", desc: "Full local needs assessment, rural housing eligibility, and county-specific checklist." },
  { label: "Extension", desc: "Exemption threshold check, protected structure flags, and planning history review." },
  { label: "Replacement Dwelling", desc: "Planning history continuity, condition assessment, and county replacement policy." },
  { label: "Retention Permission", desc: "Enforcement risk, time limits, and retrospective permission prospects assessment." },
  { label: "Protected Structure", desc: "Conservation assessment, RIAI accreditation requirements, and method statement guidance." },
  { label: "Change of Use", desc: "Use class analysis, short-term letting rules, and material change assessment." },
];

// ── Shared UI ──────────────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function StepIndicator({ current }: { current: Step }) {
  const steps: { id: Step; label: string }[] = [
    { id: "profession", label: "Profession" },
    { id: "practice",   label: "Practice"  },
    { id: "welcome",    label: "Overview"  },
    { id: "checklist",  label: "Get started" },
  ];
  const idx = steps.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center gap-0 mb-8 sm:mb-10">
      {steps.map((s, i) => (
        <div key={s.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < idx
                  ? "bg-green-600 text-white"
                  : i === idx
                  ? "bg-green-600 text-white ring-4 ring-green-100"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              {i < idx ? (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            <span className={`mt-1 text-[10px] font-medium hidden sm:block ${i === idx ? "text-green-700" : "text-gray-400"}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-8 sm:w-12 h-0.5 mx-1 rounded-full mb-3 sm:mb-4 transition-colors ${i < idx ? "bg-green-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

function IntelBadge({ type }: { type: "critical" | "warning" | "info" }) {
  if (type === "critical") return (
    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-red-100 flex items-center justify-center">
      <svg className="w-2.5 h-2.5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </span>
  );
  if (type === "warning") return (
    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-amber-100 flex items-center justify-center">
      <svg className="w-2.5 h-2.5 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    </span>
  );
  return (
    <span className="mt-0.5 shrink-0 w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center">
      <svg className="w-2.5 h-2.5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
      </svg>
    </span>
  );
}

// ── Step components ────────────────────────────────────────────────────────────

function ProfessionStep({
  selected,
  onSelect,
  onNext,
}: {
  selected: string;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          What best describes your role?
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          We&apos;ll tailor Granted to the tools most relevant to your practice.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {PROFESSIONS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelect(p.id)}
            className={`text-left flex items-start gap-4 p-4 sm:p-5 rounded-2xl border-2 transition-all ${
              selected === p.id
                ? "border-green-500 bg-green-50"
                : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              selected === p.id ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
            }`}>
              {p.icon}
            </div>
            <div className="min-w-0">
              <p className={`text-sm font-semibold ${selected === p.id ? "text-green-800" : "text-gray-900"}`}>
                {p.label}
              </p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{p.desc}</p>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!selected}
        onClick={onNext}
        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
      >
        Continue
      </button>
    </div>
  );
}

function PracticeStep({
  practiceName,
  setPracticeName,
  county,
  setCounty,
  email,
  setEmail,
  loading,
  error,
  onBack,
  onSubmit,
}: {
  practiceName: string;
  setPracticeName: (v: string) => void;
  county: string;
  setCounty: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  loading: boolean;
  error: string | null;
  onBack: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-8">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-5"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Tell us about your practice
        </h1>
        <p className="text-gray-500 text-sm sm:text-base">
          We&apos;ll use this to personalise your Granted workspace.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
          <div>
            <label className={labelCls} htmlFor="prac-name">
              Practice name <span className="text-red-500">*</span>
            </label>
            <input
              id="prac-name"
              type="text"
              value={practiceName}
              onChange={(e) => setPracticeName(e.target.value)}
              required
              autoFocus
              placeholder="e.g. Murphy Architecture Ltd"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls} htmlFor="prac-county">
              Primary county of practice <span className="text-red-500">*</span>
            </label>
            <select
              id="prac-county"
              value={county}
              onChange={(e) => setCounty(e.target.value)}
              required
              className={inputCls + " appearance-none cursor-pointer"}
            >
              <option value="" disabled>Select county…</option>
              {COUNTIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-gray-400">
              Select the county you work in most. Full intelligence is available for all 26 counties.
            </p>
          </div>

          <div>
            <label className={labelCls} htmlFor="prac-email">
              Your email <span className="text-gray-400 font-normal">(optional — for application alerts)</span>
            </label>
            <input
              id="prac-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@yourpractice.ie"
              className={inputCls}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          {loading ? (
            <>
              <Spinner />
              Saving…
            </>
          ) : (
            "See your personalised overview →"
          )}
        </button>
      </form>
    </div>
  );
}

function CountyIntelPreview({ county }: { county: string }) {
  const intel = COUNTY_INTEL[county] ?? GENERIC_INTEL;
  const levelStyles: Record<string, { wrap: string; badge: string }> = {
    red:   { wrap: "bg-red-50 border-red-200",   badge: "bg-red-100 text-red-700 border-red-200" },
    amber: { wrap: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700 border-amber-200" },
    green: { wrap: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700 border-green-200" },
    blue:  { wrap: "bg-blue-50 border-blue-200",  badge: "bg-blue-100 text-blue-700 border-blue-200" },
  };
  const s = levelStyles[intel.levelColor];

  return (
    <div className={`rounded-2xl border p-5 ${s.wrap}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="text-sm font-bold text-gray-900">Co. {county} — Planning Intelligence</span>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${s.badge}`}>
          {intel.levelLabel}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">{intel.summary}</p>
      <ul className="space-y-2.5">
        {intel.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5">
            <IntelBadge type={item.type} />
            <p className="text-xs text-gray-700 leading-relaxed">{item.text}</p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-gray-500 border-t border-black/5 pt-3">
        This preview shows a sample of the intelligence available for Co. {county}.
        The full panel — including Local Area Plans, case law, and enforcement patterns — is available in every tool.
      </p>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
          {icon}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-gray-900 mb-1">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
}

function WelcomeStep({
  practiceName,
  county,
  onContinue,
}: {
  practiceName: string;
  county: string;
  onContinue: () => void;
}) {
  return (
    <div className="max-w-2xl mx-auto">

      {/* Greeting */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-sm font-medium px-3 py-1.5 rounded-full border border-green-200 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Practice set up
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          Welcome to Granted, {practiceName.split(" ")[0]}.
        </h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
          Here&apos;s everything that&apos;s ready for you — one place for Irish planning, so you never have to search council websites, chase clients for documents, or explain the same things repeatedly.
        </p>
      </div>

      <div className="space-y-4">

        {/* 1 — County Intelligence */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">01</span>
            <h2 className="text-base font-bold text-gray-900">County intelligence for Co. {county}</h2>
          </div>
          <CountyIntelPreview county={county} />
          <p className="mt-2 text-xs text-gray-400 px-1">
            Full county intelligence is available for all 26 counties — switch county at any time inside any tool.
          </p>
        </div>

        {/* 2 — Application flows */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">02</span>
            <h2 className="text-base font-bold text-gray-900">Separate flows for every application type</h2>
          </div>
          <FeatureCard
            title="Each project type has its own tailored checklist and AI analysis"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            }
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {FLOW_TYPES.map((f) => (
                <div key={f.label} className="bg-gray-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-gray-800">{f.label}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{f.desc}</p>
                </div>
              ))}
            </div>
          </FeatureCard>
        </div>

        {/* 3 — Local Needs Questionnaire */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">03</span>
            <h2 className="text-base font-bold text-gray-900">Local needs questionnaire for rural new builds</h2>
          </div>
          <FeatureCard
            title="Check client eligibility before you take on the project"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
              </svg>
            }
          >
            <p className="text-sm text-gray-500 leading-relaxed">
              The local needs questionnaire works through the exact criteria your county&apos;s planners apply —
              family landholding, residency periods, local connection, and functional need — and gives you a clear
              eligibility assessment before you engage a client on a rural project.
              Avoid taking on cases that will be refused before you start.
            </p>
          </FeatureCard>
        </div>

        {/* 4 — County Document Library */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">04</span>
            <h2 className="text-base font-bold text-gray-900">County document library</h2>
          </div>
          <FeatureCard
            title="Every county form, notice template and editable PDF — in one place"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
              </svg>
            }
          >
            <p className="text-sm text-gray-500 leading-relaxed">
              Sample site notices, rural housing characteristic forms, farm impact statements, design statements,
              and editable PDF templates for all 26 counties — in one searchable library.
              No more hunting through council websites or reformatting documents from scratch.
            </p>
          </FeatureCard>
        </div>

        {/* 5 — Newspaper Finder */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">05</span>
            <h2 className="text-base font-bold text-gray-900">Newspaper notice finder</h2>
          </div>
          <FeatureCard
            title="Correct newspaper and correctly worded notice — every time"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
            }
          >
            <p className="text-sm text-gray-500 leading-relaxed">
              Enter the site address and Granted identifies the correct approved newspaper for the statutory site notice,
              generates the correctly worded notice text for the application type, and flags the exact wording required
              under the Planning and Development Regulations. No more deficient applications.
            </p>
          </FeatureCard>
        </div>

        {/* 6 — Client Portal */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">06</span>
            <h2 className="text-base font-bold text-gray-900">Client document upload portal</h2>
          </div>
          <FeatureCard
            title="Send clients a link — documents arrive directly into your workspace"
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 7.5h-.75A2.25 2.25 0 004.5 9.75v7.5a2.25 2.25 0 002.25 2.25h7.5a2.25 2.25 0 002.25-2.25v-7.5a2.25 2.25 0 00-2.25-2.25h-.75m0-3l-3-3m0 0l-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25h-7.5a2.25 2.25 0 01-2.25-2.25v-.75" />
              </svg>
            }
          >
            <p className="text-sm text-gray-500 leading-relaxed">
              Send clients a secure upload link for their application. They upload title documents, maps,
              photographs, and supporting letters directly into the application file in Granted — no email
              attachments, no chasing, no version confusion. Everything in one place.
            </p>
          </FeatureCard>
        </div>

      </div>

      <div className="mt-8 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onContinue}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          See your getting started checklist →
        </button>
      </div>
    </div>
  );
}

function ChecklistStep({ county }: { county: string }) {
  const [done, setDone] = useState<Set<number>>(new Set());

  const toggle = useCallback((i: number) => {
    setDone((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i); else next.add(i);
      return next;
    });
  }, []);

  const items = [
    {
      label: "Add your first application",
      desc: "Add a live application to start tracking it through the planning process.",
      href: "/dashboard",
      cta: "Go to dashboard",
    },
    {
      label: "Explore your county intelligence",
      desc: `Open the full Co. ${county} planning intelligence panel — policies, local needs criteria, and critical warnings.`,
      href: "/check",
      cta: "Open permission checker",
    },
    {
      label: "Try the document interpreter",
      desc: "Upload a planning document — conditions, an RFI, or an appeal decision — and get a plain-English breakdown.",
      href: "/interpreter",
      cta: "Open interpreter",
    },
    {
      label: "Send a client portal link",
      desc: "Test the client upload portal by sending yourself a link and uploading a document.",
      href: "/dashboard",
      cta: "Go to dashboard",
    },
  ];

  return (
    <div className="max-w-lg mx-auto">

      <div className="mb-8">
        <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
          You&apos;re all set.
        </h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
          Here&apos;s how to get the most out of Granted in your first session. Tick them off as you go.
        </p>
      </div>

      <div className="space-y-3 mb-8">
        {items.map((item, i) => (
          <div
            key={i}
            className={`bg-white border rounded-2xl p-4 sm:p-5 transition-all ${
              done.has(i) ? "border-green-200 bg-green-50" : "border-gray-200"
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => toggle(i)}
                className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                  done.has(i)
                    ? "bg-green-600 border-green-600"
                    : "border-gray-300 hover:border-green-400"
                }`}
                aria-label={done.has(i) ? "Mark as not done" : "Mark as done"}
              >
                {done.has(i) && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${done.has(i) ? "text-green-800 line-through decoration-green-400" : "text-gray-900"}`}>
                  {item.label}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{item.desc}</p>
                <Link
                  href={item.href}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 transition-colors"
                >
                  {item.cta}
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="bg-gray-900 rounded-2xl p-5 sm:p-6 text-center">
        <p className="text-white font-semibold mb-1">One stop shop for Irish planning.</p>
        <p className="text-gray-400 text-sm mb-4 leading-relaxed">
          Everything in one place — county intelligence, document tools, application tracking, and client management.
          No more searching council websites. No more chasing clients for documents.
        </p>
        <Link
          href="/dashboard"
          className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors text-sm"
        >
          Go to your dashboard
        </Link>
      </div>

    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const [step,         setStep]         = useState<Step>("profession");
  const [profession,   setProfession]   = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [county,       setCounty]       = useState("");
  const [email,        setEmail]        = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);

  async function handlePracticeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/architect-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          practiceName,
          architectEmail: email || undefined,
        }),
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error((d as { error?: string }).error ?? "Failed to save practice details. Please try again.");
      }

      setStep("welcome");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
            Granted
          </Link>
          <span className="text-xs text-gray-400">Professional setup</span>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <StepIndicator current={step} />

          {step === "profession" && (
            <ProfessionStep
              selected={profession}
              onSelect={setProfession}
              onNext={() => setStep("practice")}
            />
          )}

          {step === "practice" && (
            <PracticeStep
              practiceName={practiceName}
              setPracticeName={setPracticeName}
              county={county}
              setCounty={setCounty}
              email={email}
              setEmail={setEmail}
              loading={loading}
              error={error}
              onBack={() => setStep("profession")}
              onSubmit={handlePracticeSubmit}
            />
          )}

          {step === "welcome" && (
            <WelcomeStep
              practiceName={practiceName}
              county={county}
              onContinue={() => setStep("checklist")}
            />
          )}

          {step === "checklist" && (
            <ChecklistStep county={county} />
          )}
        </div>
      </main>

    </div>
  );
}
