"use client";

import { useState } from "react";
import { AppShell } from "@/app/components/AppShell";
import { CountyIntelPanel } from "@/app/components/CountyIntelPanel";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";

// ─── Types ─────────────────────────────────────────────────────────────────────

type FlowType = "new-build" | "extension" | "replacement";
type PageStep = "select" | "form" | "result";

interface CheckPermissionResult {
  outcome: "EXEMPT" | "LIKELY_NEEDS_PERMISSION" | "DEFINITELY_NEEDS_PERMISSION";
  headline: string;
  explanation: string;
  keyPoints: string[];
  caveat: string;
}

interface FormData {
  county: string;
  siteType: string;
  fromLocalArea: string;
  livedWithin5km: string;
  canProveConnection: string;
  withinFamilyLandholding: string;
  siteSize: string;
  extensionType: string;
  currentHouseSize: string;
  extensionSize: string;
  protectedStructure: string;
  replacementReason: string;
  currentCondition: string;
  additionalDetails: string;
}

const EMPTY_FORM: FormData = {
  county: "", siteType: "", fromLocalArea: "", livedWithin5km: "",
  canProveConnection: "", withinFamilyLandholding: "", siteSize: "",
  extensionType: "", currentHouseSize: "", extensionSize: "",
  protectedStructure: "", replacementReason: "", currentCondition: "",
  additionalDetails: "",
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const COUNTIES = [
  "Carlow","Cavan","Clare","Cork","Donegal","Dublin",
  "Galway","Kerry","Kildare","Kilkenny","Laois","Leitrim",
  "Limerick","Longford","Louth","Mayo","Meath","Monaghan",
  "Offaly","Roscommon","Sligo","Tipperary","Waterford",
  "Westmeath","Wexford","Wicklow",
];

const COUNTY_RURAL_POLICY: Record<string, { level: "strict"|"moderate"|"permissive"; headline: string; notes: string[] }> = {
  Carlow: { level: "moderate", headline: "Moderate rural housing policy — local needs test applies", notes: ["Local needs criteria apply under the County Development Plan","Accessible for applicants with genuine local connections","No unusual restrictions beyond national rural housing guidelines"] },
  Cavan: { level: "permissive", headline: "Permissive rural county — good opportunities for rural housing", notes: ["Population retention policies actively support rural one-off housing","Family landholding applications generally well received","Broadly supportive of genuine local housing needs"] },
  Clare: { level: "moderate", headline: "Moderate policy — coastal and scenic areas carry extra restrictions", notes: ["Shannon Estuary and Atlantic coastline areas are more restricted","Rural inland Clare accessible with a genuine local connection","Loop Head Peninsula and Burren designated areas require extra care"] },
  Cork: { level: "strict", headline: "Highly variable — Cork city fringe is very strict, rural Cork is moderate", notes: ["Commuter belt (Macroom, Midleton, Carrigaline corridors) strictly restricted","West Cork and remote rural areas more permissive for local needs applicants","Each Local Area Plan sets different thresholds — check your specific area carefully"] },
  Donegal: { level: "permissive", headline: "Permissive rural county with a strong tradition of rural housing", notes: ["Strong tradition of one-off rural housing and family landholding grants","Remote and declining rural areas actively encouraged","Relatively straightforward process for genuine local applicants"] },
  Dublin: { level: "strict", headline: "Extremely restrictive — among the hardest counties for rural one-off housing", notes: ["Almost all rural land designated under strong urban pressure","Agricultural need or exceptional circumstance almost always required","Very few one-off rural dwelling permissions granted annually"] },
  Galway: { level: "moderate", headline: "Varied — rural Galway more permissive, Galway city environs strict", notes: ["Gaeltacht areas have special policies supporting indigenous rural housing","County Development Plan uses a detailed rural housing matrix by area type","West Galway and Connemara areas more permissive than the east of the county"] },
  Kerry: { level: "moderate", headline: "Moderate — scenic designations restrict some areas, active rural areas accessible", notes: ["Areas of Outstanding Natural Beauty and coastal zones carry additional restrictions","Active rural areas policy supports genuine local housing needs","Ring of Kerry corridor and lakeshore areas particularly sensitive"] },
  Kildare: { level: "strict", headline: "Very strict — strong urban pressure county with a restrictive rural housing policy", notes: ["Proximity to Dublin means almost all rural land faces development pressure","Agricultural or exceptional social need almost always required","One-off rural housing permissions rare and heavily scrutinised"] },
  Kilkenny: { level: "moderate", headline: "Moderate rural housing policy — local needs criteria well defined", notes: ["County Development Plan sets clear and accessible local needs criteria","City fringe areas near Kilkenny city have tighter restrictions","Rural Kilkenny accessible for genuine local applicants"] },
  Laois: { level: "moderate", headline: "Moderate midlands county — accessible for genuine local needs", notes: ["Less commuter pressure than eastern coastal counties","Local needs test applies but conditions are reasonable to meet","No exceptional county-specific restrictions beyond national guidelines"] },
  Leitrim: { level: "permissive", headline: "One of the most permissive rural housing counties in Ireland", notes: ["Active depopulation means the county actively encourages rural housing","Family landholding applications consistently well received","Very few rural housing applications refused in genuine local needs cases"] },
  Limerick: { level: "moderate", headline: "Mixed — city environs restricted, rural Limerick more accessible", notes: ["Metropolitan Limerick areas face urban pressure and tighter restrictions","Rural County Limerick accessible for genuine local housing needs","County Development Plan outlines clear and achievable local needs criteria"] },
  Longford: { level: "permissive", headline: "Permissive midlands county — supportive of rural housing", notes: ["Population retention policies actively support rural housing","Good opportunities for family landholding applications","Broadly permissive approach for genuine local needs applicants"] },
  Louth: { level: "strict", headline: "Strict — small county with significant Dublin commuter pressure", notes: ["Proximity to Dublin and Belfast creates strong urban development pressure","Strict rural housing policy limits one-off dwelling approvals","Exceptional local need required in most rural zones"] },
  Mayo: { level: "permissive", headline: "Broadly permissive rural county with a strong rural housing tradition", notes: ["Strong tradition of rural housing and family landholding","Population decline areas actively encouraged for rural settlement","Generally supportive of one-off housing for genuine local applicants"] },
  Meath: { level: "strict", headline: "Very strict — major Dublin commuter county with a restrictive rural policy", notes: ["Among the most restricted rural housing counties outside Dublin and Wicklow","Strong anti-sporadic development policy applies across most rural areas","Agricultural need or very strong exceptional case usually required"] },
  Monaghan: { level: "permissive", headline: "Generally permissive border county — good for rural one-off housing", notes: ["Rural character and lower development pressure supports one-off housing","Family landholding applications consistently well received","Good opportunities for genuine local applicants"] },
  Offaly: { level: "moderate", headline: "Moderate midlands county — accessible for genuine local needs", notes: ["Less urban pressure than eastern counties","Local needs test applies but conditions are reasonable","No exceptional county-specific restrictions"] },
  Roscommon: { level: "permissive", headline: "Permissive rural county — good opportunities for rural housing", notes: ["Active rural areas policy supports one-off housing","Population retention policies broadly supportive","Family landholding applications well received"] },
  Sligo: { level: "moderate", headline: "Moderate — coastal and scenic areas restricted, rural areas more accessible", notes: ["Sligo Bay, Benbulben, and Ox Mountains carry additional landscape restrictions","Rural areas away from sensitive landscapes more accessible for local needs","County Development Plan distinguishes between strong rural and weaker rural areas"] },
  Tipperary: { level: "moderate", headline: "Balanced rural housing policy in a large and diverse county", notes: ["Large county with varied rural character across North and South Tipperary","Local needs criteria apply and are achievable with genuine connections","No exceptional restrictions outside urban fringe areas"] },
  Waterford: { level: "moderate", headline: "Mixed policy — city fringe restricted, rural county more permissive", notes: ["Waterford City metropolitan area has stricter rural housing restrictions","County Development Plan sets clear local needs criteria for rural areas","Coastal areas carry additional landscape protections"] },
  Westmeath: { level: "moderate", headline: "Moderate midlands county — lakeshore areas carry extra restrictions", notes: ["Lough Ree and Lough Derravaragh shorelines restricted for amenity reasons","Rural inland areas generally accessible for genuine local connections","No exceptional restrictions beyond national guidelines for most of the county"] },
  Wexford: { level: "moderate", headline: "Moderate rural housing policy — coastal areas more restricted", notes: ["Wexford coastal areas carry additional scenic/landscape restrictions","Rural hinterland accessible for genuine local needs applicants","County Development Plan provides a clear local needs framework"] },
  Wicklow: { level: "strict", headline: "Very strict — proximity to Dublin creates strong restrictions on rural housing", notes: ["Among the most restrictive counties outside Dublin","Strong anti-sporadic development policy throughout most of the county","Exceptional need or agricultural connection almost always required"] },
};

const OUTCOME_CONFIG = {
  EXEMPT: { badge: "bg-green-100 text-green-700 border border-green-200", dot: "bg-green-600", card: "border-green-200 bg-green-50", heading: "text-green-700", bullet: "bg-green-600", note: "bg-green-100 border-green-200 text-green-700", bodyText: "text-green-900" },
  LIKELY_NEEDS_PERMISSION: { badge: "bg-amber-100 text-amber-700 border border-amber-200", dot: "bg-amber-600", card: "border-amber-200 bg-amber-50", heading: "text-amber-700", bullet: "bg-amber-600", note: "bg-amber-100 border-amber-200 text-amber-700", bodyText: "text-amber-900" },
  DEFINITELY_NEEDS_PERMISSION: { badge: "bg-red-100 text-red-700 border border-red-200", dot: "bg-red-600", card: "border-red-200 bg-red-50", heading: "text-red-700", bullet: "bg-red-600", note: "bg-red-100 border-red-200 text-red-700", bodyText: "text-red-900" },
} as const;

const OUTCOME_LABELS: Record<FlowType, Record<string, string>> = {
  "new-build": { EXEMPT: "Strong Case for Permission", LIKELY_NEEDS_PERMISSION: "Possible Case — Challenges Exist", DEFINITELY_NEEDS_PERMISSION: "Permission Required" },
  extension: { EXEMPT: "Exempt from Permission", LIKELY_NEEDS_PERMISSION: "Likely Needs Permission", DEFINITELY_NEEDS_PERMISSION: "Needs Permission" },
  replacement: { EXEMPT: "Likely Eligible", LIKELY_NEEDS_PERMISSION: "Permission Required — Case Possible", DEFINITELY_NEEDS_PERMISSION: "Permission Required" },
};

const labelClass = "block text-sm font-medium text-gray-700 mb-2";
const inputClass = "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";

// ─── UI Helpers ────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      Back
    </button>
  );
}

function YesNoToggle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2 mt-2">
      <button type="button" onClick={() => onChange("yes")} className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${value === "yes" ? "bg-green-600 text-white border-green-600 shadow-sm" : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-700"}`}>Yes</button>
      <button type="button" onClick={() => onChange("no")} className={`px-5 py-2 rounded-lg text-sm font-semibold border transition-colors ${value === "no" ? "bg-red-500 text-white border-red-500 shadow-sm" : "bg-white text-gray-600 border-gray-300 hover:border-red-300 hover:text-red-600"}`}>No</button>
    </div>
  );
}

// ─── Flow Selector ─────────────────────────────────────────────────────────────

function FlowSelector({ onSelect }: { onSelect: (f: FlowType) => void }) {
  return (
    <div>
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Permission Checker</h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">Tell us what type of project you have in mind and we&apos;ll guide you through the relevant planning questions under current Irish planning law.</p>
      </div>
      <p className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">What are you planning to do?</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {([
          { type: "new-build" as FlowType, title: "New Build", desc: "I want to build a new house on a site", icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" /></svg> },
          { type: "extension" as FlowType, title: "Extension or Renovation", desc: "I want to extend or modify my existing home", icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg> },
          { type: "replacement" as FlowType, title: "Replacement Dwelling", desc: "I want to demolish and rebuild on the same site", icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg> },
        ] as { type: FlowType; title: string; desc: string; icon: React.ReactNode }[]).map(({ type, title, desc, icon }) => (
          <button key={type} onClick={() => onSelect(type)} className="group text-left bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-green-400 hover:shadow-md active:scale-[0.98] transition-all">
            <div className="w-12 h-12 rounded-xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center text-green-600 mb-4 transition-colors">{icon}</div>
            <h2 className="text-base font-bold text-gray-900 mb-1.5">{title}</h2>
            <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-green-600 group-hover:gap-2 transition-all">
              Get started
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── County Intelligence Panel ─────────────────────────────────────────────────

function CountyIntelligencePanel({ county }: { county: string }) {
  const policy = COUNTY_RURAL_POLICY[county];
  if (!policy) return null;
  const colors = {
    strict: { wrap: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700 border border-red-200", icon: "text-red-400", bullet: "bg-red-400", text: "text-red-900", label: "text-red-700" },
    moderate: { wrap: "bg-amber-50 border-amber-200", badge: "bg-amber-100 text-amber-700 border border-amber-200", icon: "text-amber-400", bullet: "bg-amber-400", text: "text-amber-900", label: "text-amber-700" },
    permissive: { wrap: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700 border border-green-200", icon: "text-green-500", bullet: "bg-green-500", text: "text-green-900", label: "text-green-700" },
  };
  const c = colors[policy.level];
  const levelLabel = { strict: "Strict", moderate: "Moderate", permissive: "Permissive" }[policy.level];
  return (
    <div className={`rounded-xl border p-4 mt-3 ${c.wrap}`}>
      <div className="flex items-start gap-3">
        <svg className={`w-4 h-4 mt-0.5 flex-shrink-0 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`text-xs font-bold uppercase tracking-wide ${c.label}`}>{county} — Rural Housing Policy</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${c.badge}`}>{levelLabel}</span>
          </div>
          <p className={`text-xs font-medium mb-2 ${c.text}`}>{policy.headline}</p>
          <ul className="space-y-1">
            {policy.notes.map((note, i) => (
              <li key={i} className={`flex items-start gap-2 text-xs ${c.text}`}>
                <span className={`mt-1.5 w-1 h-1 rounded-full flex-shrink-0 ${c.bullet}`} />
                {note}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ─── New Build Form ────────────────────────────────────────────────────────────

function NewBuildForm({ data, onChange, onBack, onSubmit, loading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; onBack: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean }) {
  const anyAnswered = data.fromLocalArea !== "" || data.livedWithin5km !== "";
  const criticalFail = data.fromLocalArea === "no" && data.livedWithin5km === "no";
  const purchasedNotFamily = data.siteType === "purchased" && data.withinFamilyLandholding === "no";
  const showWarning = anyAnswered && (criticalFail || purchasedNotFamily);

  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" /></svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900">New Build</h2>
        </div>
        <p className="text-sm text-gray-500">Planning permission is always required for a new dwelling in Ireland. This tool assesses your likely eligibility under rural housing guidelines and your county&apos;s development plan.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div>
          <label className={labelClass} htmlFor="nb-county">County <span className="text-red-500">*</span></label>
          <select id="nb-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select a county…</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {data.county && <CountyIntelligencePanel county={data.county} />}
        </div>

        <div>
          <label className={labelClass} htmlFor="nb-site-type">Site type <span className="text-red-500">*</span></label>
          <select id="nb-site-type" value={data.siteType} onChange={(e) => onChange("siteType", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select…</option>
            <option value="family-land">Family landholding — land has been in my family</option>
            <option value="purchased">Purchased site — I bought or intend to buy this land</option>
          </select>
        </div>

        <div className="space-y-5 pt-1">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-semibold text-gray-700">Local Needs Assessment</h3>
            <p className="text-xs text-gray-400 mt-1">Most counties apply a local needs test to rural housing applications. Answer honestly — this helps assess your likely eligibility.</p>
          </div>
          <div>
            <label className={labelClass}>Are you from the local area? <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-400 mb-1">Born, raised, or with strong family roots in the townland or surrounding area.</p>
            <YesNoToggle value={data.fromLocalArea} onChange={(v) => onChange("fromLocalArea", v)} />
          </div>
          <div>
            <label className={labelClass}>Have you lived within 5 km of the site for the required period? <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-400 mb-1">Most county development plans require at least 5 of the last 10 years.</p>
            <YesNoToggle value={data.livedWithin5km} onChange={(v) => onChange("livedWithin5km", v)} />
          </div>
          <div>
            <label className={labelClass}>Can you prove your local connection? <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-400 mb-1">e.g. employment locally, family dependents nearby, utility bills, school enrolment.</p>
            <YesNoToggle value={data.canProveConnection} onChange={(v) => onChange("canProveConnection", v)} />
          </div>
          <div>
            <label className={labelClass}>Is the proposed site within your family&apos;s landholding? <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-400 mb-1">Land owned by you or a close family member for a sustained period.</p>
            <YesNoToggle value={data.withinFamilyLandholding} onChange={(v) => onChange("withinFamilyLandholding", v)} />
          </div>
        </div>

        {showWarning && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex gap-3">
            <svg className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-orange-800 mb-1">You may face significant difficulty obtaining permission</p>
              <p className="text-xs text-orange-700 leading-relaxed">
                {criticalFail
                  ? "You have indicated that you are not from the local area and have not lived within 5 km for the required period. Most counties require at least one of these to pass the local needs test. You may still have a case if you have exceptional circumstances — a planning consultant's advice is strongly recommended before proceeding."
                  : "A purchased site that is not within a family landholding faces significant restrictions. Permission on such a site requires a demonstrable housing need tied to the specific locality, which can be difficult to establish without local origins or sustained local residency."}
              </p>
            </div>
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="nb-size">Approximate site size (square metres) <span className="text-red-500">*</span></label>
          <input id="nb-size" type="number" min="100" max="500000" step="1" value={data.siteSize} onChange={(e) => onChange("siteSize", e.target.value)} required placeholder="e.g. 2000" className={inputClass} />
          <p className="mt-1.5 text-xs text-gray-400">Typical rural sites are 0.2–1 acre (800–4,000 sqm). Larger sites may raise concerns about land subdivision.</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="nb-details">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea id="nb-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={3} placeholder="e.g. Planning for a family of four. Site has road frontage and access to mains water. Close to the nearest village." className={inputClass + " resize-none leading-relaxed"} />
        </div>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
          {loading ? <><Spinner />Analysing your project…</> : "Check planning eligibility"}
        </button>
      </form>
    </div>
  );
}

// ─── Extension Form ────────────────────────────────────────────────────────────

const EXTENSION_TYPES = ["Rear Extension (single-storey)","Rear Extension (two-storey)","Side Extension","Wrap-Around Extension (rear + side)","Attic Conversion / Dormer","Garage Conversion","Porch / Entrance","Other / Mixed"];

function ExtensionForm({ data, onChange, onBack, onSubmit, loading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; onBack: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900">Extension or Renovation</h2>
        </div>
        <p className="text-sm text-gray-500">Many household extensions fall within exempted development thresholds under the updated March 2026 regulations. Let&apos;s check whether yours requires planning permission.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="ext-county">County <span className="text-red-500">*</span></label>
            <select id="ext-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select a county…</option>
              {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ext-type">Type of extension <span className="text-red-500">*</span></label>
            <select id="ext-type" value={data.extensionType} onChange={(e) => onChange("extensionType", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              {EXTENSION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="ext-current-size">Current house size (sqm) <span className="text-red-500">*</span></label>
            <input id="ext-current-size" type="number" min="10" max="2000" step="1" value={data.currentHouseSize} onChange={(e) => onChange("currentHouseSize", e.target.value)} required placeholder="e.g. 100" className={inputClass} />
            <p className="mt-1 text-xs text-gray-400">Total floor area of the existing house.</p>
          </div>
          <div>
            <label className={labelClass} htmlFor="ext-size">Proposed extension size (sqm) <span className="text-red-500">*</span></label>
            <input id="ext-size" type="number" min="1" max="2000" step="1" value={data.extensionSize} onChange={(e) => onChange("extensionSize", e.target.value)} required placeholder="e.g. 30" className={inputClass} />
            <p className="mt-1 text-xs text-gray-400">Floor area of the new extension only.</p>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="ext-protected">Is the house a protected structure or in an Architectural Conservation Area (ACA)? <span className="text-red-500">*</span></label>
          <select id="ext-protected" value={data.protectedStructure} onChange={(e) => onChange("protectedStructure", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select…</option>
            <option value="no">No</option>
            <option value="yes">Yes — it is a protected structure or in an ACA</option>
            <option value="unsure">Unsure — I have not checked</option>
          </select>
          <p className="mt-1.5 text-xs text-gray-400">Check your local authority&apos;s Record of Protected Structures online. Protected structures require permission for works that affect their character.</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="ext-details">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea id="ext-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={3} placeholder="e.g. Semi-detached house built in 1985. No previous extensions. Rear garden is approx. 60 sqm." className={inputClass + " resize-none leading-relaxed"} />
          <p className="mt-1.5 text-xs text-gray-400">House type, year built, previous extensions, and garden size all affect the result.</p>
        </div>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
          {loading ? <><Spinner />Analysing your project…</> : "Check planning permission"}
        </button>
      </form>
    </div>
  );
}

// ─── Replacement Dwelling Form ─────────────────────────────────────────────────

const REPLACEMENT_REASONS = ["Derelict or ruined structure","Structurally unsafe or condemned","Fire or flood damage","Upgrading a substandard old cottage","Significant deterioration — unfit for habitation","Other"];
const DWELLING_CONDITIONS = ["Ruins only — walls standing but no roof","Uninhabitable — structurally compromised or no basic services","Habitable but in very poor condition","Currently occupied or habitable"];

function ReplacementForm({ data, onChange, onBack, onSubmit, loading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; onBack: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900">Replacement Dwelling</h2>
        </div>
        <p className="text-sm text-gray-500">Replacing an existing dwelling is treated differently from a new build. The existing structure&apos;s condition and planning history are key factors in assessing your application.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div>
          <label className={labelClass} htmlFor="rep-county">County <span className="text-red-500">*</span></label>
          <select id="rep-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select a county…</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="rep-reason">Reason for replacement <span className="text-red-500">*</span></label>
          <select id="rep-reason" value={data.replacementReason} onChange={(e) => onChange("replacementReason", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select a reason…</option>
            {REPLACEMENT_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="rep-condition">Current condition of the existing dwelling <span className="text-red-500">*</span></label>
          <select id="rep-condition" value={data.currentCondition} onChange={(e) => onChange("currentCondition", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select…</option>
            {DWELLING_CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <p className="mt-1.5 text-xs text-gray-400">The condition of the existing structure is one of the most important factors a planner will consider. A photographic record is strongly recommended.</p>
        </div>

        <div>
          <label className={labelClass} htmlFor="rep-details">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea id="rep-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={3} placeholder="e.g. Derelict cottage last used in the 1970s. Was granted planning permission in 1965. Stone walls intact, no roof remaining." className={inputClass + " resize-none leading-relaxed"} />
          <p className="mt-1.5 text-xs text-gray-400">Include any known planning history, ownership details, or information about the original structure. A continuous planning/use history significantly strengthens an application.</p>
        </div>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
          {loading ? <><Spinner />Analysing your project…</> : "Check planning requirements"}
        </button>
      </form>
    </div>
  );
}

// ─── Result Panel ──────────────────────────────────────────────────────────────

function ResultPanel({ result, flowType, onReset }: { result: CheckPermissionResult; flowType: FlowType; onReset: () => void }) {
  const config = OUTCOME_CONFIG[result.outcome];
  const label = OUTCOME_LABELS[flowType][result.outcome];
  return (
    <div>
      <button type="button" onClick={onReset} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
        Start over
      </button>
      <div id="result" className={`rounded-2xl border ${config.card} p-5 sm:p-6 lg:p-8`}>
        <div className="mb-4 sm:mb-5">
          <span className={`inline-flex items-center gap-2 text-sm font-semibold px-3 py-1.5 rounded-full ${config.badge}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${config.dot}`} />
            {label}
          </span>
        </div>
        <h2 className={`text-lg sm:text-xl font-bold mb-4 sm:mb-5 ${config.heading}`}>{result.headline}</h2>
        <div className={`text-sm leading-relaxed space-y-3 mb-6 sm:mb-7 ${config.bodyText}`}>
          {result.explanation.split("\n\n").map((para, i) => <p key={i}>{para}</p>)}
        </div>
        {result.keyPoints?.length > 0 && (
          <div className="mb-6 sm:mb-7">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Key factors</h3>
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
        {result.caveat && (
          <div className={`rounded-xl px-4 py-3 text-sm border ${config.note}`}>
            <span className="font-semibold">Note: </span>{result.caveat}
          </div>
        )}
        <button type="button" onClick={onReset} className="mt-5 sm:mt-6 text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors">
          Check another project
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function CheckPage() {
  const { isPaid } = useAuthStatus();
  const [step, setStep] = useState<PageStep>("select");
  const [flowType, setFlowType] = useState<FlowType | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckPermissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleFlowSelect(flow: FlowType) {
    setFlowType(flow);
    setFormData(EMPTY_FORM);
    setResult(null);
    setError(null);
    setStep("form");
  }

  function handleFieldChange(field: keyof FormData, value: string) {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }

  function handleBack() {
    setStep("select");
    setFlowType(null);
    setResult(null);
    setError(null);
  }

  function handleReset() {
    setStep("select");
    setFlowType(null);
    setFormData(EMPTY_FORM);
    setResult(null);
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/check-permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowType, ...formData }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data as CheckPermissionResult);
      setStep("result");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-3xl mx-auto">

        {step === "select" && <FlowSelector onSelect={handleFlowSelect} />}

        {step === "form" && flowType === "new-build" && (
          <NewBuildForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "extension" && (
          <ExtensionForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "replacement" && (
          <ReplacementForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}

        {step === "result" && result && flowType && (
          <ResultPanel result={result} flowType={flowType} onReset={handleReset} />
        )}

        {/* County intelligence panel — shown during form step when county is selected */}
        {step === "form" && formData.county && (
          <CountyIntelPanel county={formData.county} isPaid={isPaid} className="mt-5" />
        )}

        {error && (
          <div className="mt-5 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        <div className="mt-8 sm:mt-10 flex gap-3 bg-gray-50 border border-gray-200 rounded-xl p-4">
          <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          <p className="text-xs text-gray-500 leading-relaxed">
            <span className="font-semibold text-gray-600">Guidance only — not legal advice.</span>{" "}
            This tool provides general guidance based on national planning regulations and typical county development plan policies. It is not a substitute for advice from a qualified planning consultant, architect, or solicitor. Always confirm requirements with your local planning authority before commencing any works.
          </p>
        </div>

      </div>
    </AppShell>
  );
}
