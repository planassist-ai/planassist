"use client";

import { useState, useEffect } from "react";
import { AppShell } from "@/app/components/AppShell";
import { CountyIntelPanel } from "@/app/components/CountyIntelPanel";
import { LegalDisclaimer } from "@/app/components/LegalDisclaimer";
import { GrantsAlert } from "@/app/components/GrantsAlert";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import { isDemoMode } from "@/lib/demo-mode";
import { DEMO_SCENARIO_RESULTS } from "@/lib/demo-data";
import type { GrantFlowType } from "@/lib/grants";
import type { ProfessionType } from "@/lib/professionals";

// ─── Types ─────────────────────────────────────────────────────────────────────

type FlowType = "new-build" | "extension" | "replacement" | "outbuildings" | "appearance" | "agricultural" | "change-of-use" | "other-works" | "retention" | "protected-structure";
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
  withinSettlementBoundary: string;
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
  // Outbuildings
  structureType: string;
  structureFootprint: string;
  structureHeight: string;
  withinCurtilage: string;
  // Appearance
  appearanceType: string;
  // Agricultural
  agriculturalType: string;
  isFarmer: string;
  // Change of use
  currentUse: string;
  proposedUse: string;
  // Other works
  worksDescription: string;
  // Retention
  retentionWorksType: string;
  retentionWorksDate: string;
  retentionVisible: string;
  retentionEnforcement: string;
  // Protected structure
  psWorksType: string;
  psStructureType: string;
  additionalDetails: string;
}

const EMPTY_FORM: FormData = {
  county: "", withinSettlementBoundary: "", siteType: "", fromLocalArea: "", livedWithin5km: "",
  canProveConnection: "", withinFamilyLandholding: "", siteSize: "",
  extensionType: "", currentHouseSize: "", extensionSize: "",
  protectedStructure: "", replacementReason: "", currentCondition: "",
  structureType: "", structureFootprint: "", structureHeight: "", withinCurtilage: "",
  appearanceType: "", agriculturalType: "", isFarmer: "",
  currentUse: "", proposedUse: "", worksDescription: "",
  retentionWorksType: "", retentionWorksDate: "", retentionVisible: "", retentionEnforcement: "",
  psWorksType: "", psStructureType: "",
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
  outbuildings: { EXEMPT: "Likely Exempt", LIKELY_NEEDS_PERMISSION: "May Need Permission", DEFINITELY_NEEDS_PERMISSION: "Permission Required" },
  appearance: { EXEMPT: "Likely Exempt", LIKELY_NEEDS_PERMISSION: "May Need Permission", DEFINITELY_NEEDS_PERMISSION: "Permission Required" },
  agricultural: { EXEMPT: "Likely Exempt Development", LIKELY_NEEDS_PERMISSION: "Permission May Be Required", DEFINITELY_NEEDS_PERMISSION: "Permission Required" },
  "change-of-use": { EXEMPT: "Likely Exempt", LIKELY_NEEDS_PERMISSION: "Permission May Be Required", DEFINITELY_NEEDS_PERMISSION: "Permission Required" },
  "other-works": { EXEMPT: "Likely Exempt", LIKELY_NEEDS_PERMISSION: "May Need Permission", DEFINITELY_NEEDS_PERMISSION: "Permission Required" },
  retention: { EXEMPT: "Strong Case for Retention", LIKELY_NEEDS_PERMISSION: "Retention Possible — Challenges Exist", DEFINITELY_NEEDS_PERMISSION: "Retention Uncertain — Enforcement Risk" },
  "protected-structure": { EXEMPT: "Works Likely Acceptable — Permission Required", LIKELY_NEEDS_PERMISSION: "Significant Conservation Assessment Required", DEFINITELY_NEEDS_PERMISSION: "Works Very Unlikely to Be Permitted" },
};

const FLOW_REGULATION_REFS: Partial<Record<FlowType, { ref: string; detail: string }>> = {
  "extension":           { ref: "Planning & Development Regulations 2001, Schedule 2, Part 1, Class 1 (as updated March 2026)", detail: "Rear extensions up to 40 sqm (semi-detached/terraced) or 50 sqm (detached) are exempt development, subject to garden area and height limits." },
  "new-build":           { ref: "Planning & Development Act 2000, s.32 + Sustainable Rural Housing Guidelines 2005 (DoEHLG)", detail: "All new dwellings require planning permission. Rural applications are assessed under local needs criteria set out in each County Development Plan." },
  "outbuildings":        { ref: "Planning & Development Regulations 2001, Schedule 2, Part 1, Classes 3 & 5", detail: "Class 3 covers domestic outbuildings (garages, sheds, garden rooms) up to 25–40 sqm. Class 5 covers boundary walls and fences up to 1.2m (road) or 2m (other)." },
  "appearance":          { ref: "Planning & Development Regulations 2001, Schedule 2, Part 1, Class 2", detail: "Works of maintenance and improvement that do not materially affect external appearance are exempt. Solar panel exemptions were updated March 2026." },
  "replacement":         { ref: "Planning & Development Act 2000, s.32 + County Development Plan rural housing policies", detail: "Replacement dwellings always require planning permission. Assessment focuses on whether the existing structure is genuinely being replaced and whether local needs criteria are satisfied." },
  "agricultural":        { ref: "Planning & Development Regulations 2001, Schedule 2, Part 3", detail: "Agricultural exemptions cover a range of farm buildings and structures, subject to floor area limits and conditions set out in Part 3 of Schedule 2." },
  "change-of-use":       { ref: "Planning & Development Act 2000, s.3 + Schedule 2, Part 1, Class 14", detail: "Changes between materially different uses require planning permission. Some changes between similar use classes may be exempt under Class 14." },
  "retention":           { ref: "Planning & Development Act 2000, s.34(12)", detail: "Section 34(12) allows a planning authority to grant retention permission for development carried out without prior permission, assessed on the same merits as a standard application." },
  "protected-structure": { ref: "Planning & Development Act 2000, Part IV (ss.51–80)", detail: "Works to a protected structure or within its curtilage that affect the character of the structure require planning permission. Standard exemptions generally do not apply." },
  "other-works":         { ref: "Planning & Development Act 2000, s.4 + Schedule 2, Part 1", detail: "The exempted development schedule in Part 1 of Schedule 2 covers many minor works. Works not covered by a class in the schedule require planning permission." },
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
      <button type="button" onClick={() => onChange("yes")} className={`px-5 py-3 rounded-lg text-sm font-semibold border transition-colors ${value === "yes" ? "bg-green-600 text-white border-green-600 shadow-sm" : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-700"}`}>Yes</button>
      <button type="button" onClick={() => onChange("no")} className={`px-5 py-3 rounded-lg text-sm font-semibold border transition-colors ${value === "no" ? "bg-red-500 text-white border-red-500 shadow-sm" : "bg-white text-gray-600 border-gray-300 hover:border-red-300 hover:text-red-600"}`}>No</button>
    </div>
  );
}

// ─── Flow Selector ─────────────────────────────────────────────────────────────

function FlowSelector({ onSelect, county, onCountyChange }: { onSelect: (f: FlowType) => void; county: string; onCountyChange: (c: string) => void }) {
  const flows: { type: FlowType; title: string; desc: string; icon: React.ReactNode }[] = [
    {
      type: "new-build",
      title: "New Build",
      desc: "I want to build a new house on land I own",
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21" /></svg>,
    },
    {
      type: "extension",
      title: "Extension or Alteration",
      desc: "I want to extend, convert loft, add dormer, or modify my existing home",
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>,
    },
    {
      type: "replacement",
      title: "Replacement Dwelling",
      desc: "I want to demolish and rebuild an existing house",
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>,
    },
    {
      type: "outbuildings",
      title: "Outbuildings and Structures",
      desc: "I want to build a garage, shed, garden room, boundary wall, gate, railings or other structure",
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>,
    },
    {
      type: "appearance",
      title: "Change of Appearance",
      desc: "I want to change external finishes, add stone cladding, render, replace windows or doors, add solar panels or change the look of my home",
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>,
    },
    {
      type: "agricultural",
      title: "Agricultural and Rural Works",
      desc: "I want to remove or add a cattle grid, build farm buildings, construct silage or slurry storage, create a new access road or carry out other agricultural works",
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c-.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>,
    },
    {
      type: "change-of-use",
      title: "Change of Use",
      desc: "I want to convert a building from one use to another such as garage to living space or commercial to residential",
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>,
    },
    {
      type: "other-works",
      title: "Other Works",
      desc: "Something else that might need planning permission",
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L3 3l1.5 1.5 3.75.75 5.91 5.91" /></svg>,
    },
    {
      type: "retention",
      title: "Retention Permission",
      desc: "I have already carried out works without planning permission and need to apply retrospectively",
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
    },
    {
      type: "protected-structure",
      title: "Protected Structure",
      desc: "I want to carry out works to a building on the Record of Protected Structures",
      icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
    },
  ];

  return (
    <div>
      <div className="mb-8 sm:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">Permission Checker</h1>
        <p className="text-gray-500 text-sm sm:text-base leading-relaxed">Tell us what type of project you have in mind and we&apos;ll guide you through the relevant planning questions under current Irish planning law.</p>
      </div>

      {/* County selector — shown first, prominent */}
      <div className="mb-8 bg-green-50 border border-green-200 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Which county is the property in?</p>
            <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">Planning rules vary significantly by county in Ireland — your county affects the assessment and determines which local rules apply.</p>
          </div>
        </div>
        <select
          value={county}
          onChange={(e) => onCountyChange(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer"
        >
          <option value="" disabled>Select a county…</option>
          {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <p className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">What are you planning to do?</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {flows.map(({ type, title, desc, icon }) => (
          <button key={type} onClick={() => onSelect(type)} className="group text-left bg-white border border-gray-200 rounded-2xl p-5 hover:border-green-400 hover:shadow-md active:scale-[0.98] transition-all">
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
  const inSettlement   = data.withinSettlementBoundary === "yes";
  const inRural        = data.withinSettlementBoundary === "no";
  const boundarySet    = data.withinSettlementBoundary !== "";

  const anyAnswered    = data.fromLocalArea !== "" || data.livedWithin5km !== "";
  const criticalFail   = data.fromLocalArea === "no" && data.livedWithin5km === "no";
  const purchasedNotFamily = data.siteType === "purchased" && data.withinFamilyLandholding === "no";
  const showWarning    = inRural && anyAnswered && (criticalFail || purchasedNotFamily);

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
        <p className="text-sm text-gray-500">Planning permission is always required for a new dwelling in Ireland. This tool assesses your likely eligibility based on your county&apos;s development plan and, where applicable, rural housing guidelines.</p>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">

        {/* County */}
        <div>
          <label className={labelClass} htmlFor="nb-county">County <span className="text-red-500">*</span></label>
          <select id="nb-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select a county…</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          {data.county && <CountyIntelligencePanel county={data.county} />}
        </div>

        {/* Settlement boundary question — gate for the rest of the form */}
        {data.county && (
          <div>
            <label className={labelClass}>Is your site within a defined town or village boundary? <span className="text-red-500">*</span></label>
            <p className="text-xs text-gray-400 mb-2">
              Local needs requirements only apply to one-off rural houses <strong>outside</strong> defined settlement boundaries. If your site is within a town or village as set out in the county development plan, standard planning criteria apply and a local needs assessment is not required.
            </p>
            <YesNoToggle value={data.withinSettlementBoundary} onChange={(v) => onChange("withinSettlementBoundary", v)} />

            {/* Meath-specific note */}
            {data.county === "Meath" && boundarySet && (
              <div className="mt-3 rounded-lg bg-blue-50 border border-blue-100 p-3">
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Note for Meath:</strong> Town centres including Ratoath, Trim, Kells, and Dunshaughlin are within defined settlement boundaries and do not require a local needs assessment. Check the Meath County Development Plan settlement hierarchy to confirm the classification of your site.
                </p>
              </div>
            )}

            {/* General settlement note */}
            {inSettlement && (
              <div className="mt-3 rounded-lg bg-green-50 border border-green-200 p-3">
                <p className="text-xs text-green-800 leading-relaxed">
                  <strong>Good news:</strong> Sites within defined settlement boundaries are assessed on standard planning merits — design, access, services, and consistency with zoning — not on local needs. Planning permission is still required, but the local needs test does not apply.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Rural-only: site type */}
        {inRural && (
          <div>
            <label className={labelClass} htmlFor="nb-site-type">Site type <span className="text-red-500">*</span></label>
            <select id="nb-site-type" value={data.siteType} onChange={(e) => onChange("siteType", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              <option value="family-land">Family landholding — land has been in my family</option>
              <option value="purchased">Purchased site — I bought or intend to buy this land</option>
            </select>
          </div>
        )}

        {/* Rural-only: local needs section */}
        {inRural && (
          <div className="space-y-5 pt-1">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-sm font-semibold text-gray-700">Local Needs Assessment</h3>
              <p className="text-xs text-gray-400 mt-1">Most counties apply a local needs test to rural one-off housing applications. Answer honestly — this helps assess your likely eligibility.</p>
              <p className="text-xs text-gray-400 mt-1">
                <strong>Note:</strong> Local needs requirements vary by county development plan and apply specifically to one-off rural houses outside defined settlement boundaries. They are intended to restrict urban-generated housing demand in the countryside while supporting genuine rural communities.
              </p>
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
        )}

        {/* Rural-only: local needs warning */}
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

        {/* Site size — shown once boundary question is answered */}
        {boundarySet && (
          <div>
            <label className={labelClass} htmlFor="nb-size">Approximate site size (square metres) <span className="text-red-500">*</span></label>
            <input id="nb-size" type="number" min="100" max="500000" step="1" value={data.siteSize} onChange={(e) => onChange("siteSize", e.target.value)} required placeholder="e.g. 2000" className={inputClass} />
            <p className="mt-1.5 text-xs text-gray-400">
              {inRural
                ? "Typical rural sites are 0.2–1 acre (800–4,000 sqm). Larger sites may raise concerns about land subdivision."
                : "Typical urban sites are 200–600 sqm. Planning authorities will consider plot size in relation to the proposed dwelling."}
            </p>
          </div>
        )}

        {/* Additional details — shown once boundary question is answered */}
        {boundarySet && (
          <div>
            <label className={labelClass} htmlFor="nb-details">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
            <textarea id="nb-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={3} placeholder={inSettlement ? "e.g. Infill site on Main Street. Two-storey detached house proposed. Existing dwelling to be demolished." : "e.g. Planning for a family of four. Site has road frontage and access to mains water. Close to the nearest village."} className={inputClass + " resize-none leading-relaxed"} />
          </div>
        )}

        {/* Submit — only once boundary question is answered */}
        {boundarySet && (
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
            {loading ? <><Spinner />Analysing your project…</> : "Check planning eligibility"}
          </button>
        )}

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

// ─── Outbuildings Form ─────────────────────────────────────────────────────────

const STRUCTURE_TYPES = ["Garage","Shed or Storage Outbuilding","Garden Room or Home Office","Greenhouse","Boundary Wall","Gate or Railings","Swimming Pool or Pond","Other Structure"];

function OutbuildingsForm({ data, onChange, onBack, onSubmit, loading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; onBack: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" /></svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900">Outbuildings and Structures</h2>
        </div>
        <p className="text-sm text-gray-500">Many small structures are exempt from planning permission under Irish planning regulations. This tool checks whether your proposed structure requires permission.</p>
      </div>
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="ob-county">County <span className="text-red-500">*</span></label>
            <select id="ob-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select a county…</option>
              {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ob-type">Type of structure <span className="text-red-500">*</span></label>
            <select id="ob-type" value={data.structureType} onChange={(e) => onChange("structureType", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              {STRUCTURE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Is the structure within the curtilage of your house? <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-400 mb-1">Within the garden or yard area that belongs to and is used with the house.</p>
          <YesNoToggle value={data.withinCurtilage} onChange={(v) => onChange("withinCurtilage", v)} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="ob-footprint">Floor area (sqm) <span className="text-red-500">*</span></label>
            <input id="ob-footprint" type="number" min="1" max="500" step="1" value={data.structureFootprint} onChange={(e) => onChange("structureFootprint", e.target.value)} required placeholder="e.g. 20" className={inputClass} />
            <p className="mt-1 text-xs text-gray-400">Ground floor footprint of the proposed structure.</p>
          </div>
          <div>
            <label className={labelClass} htmlFor="ob-height">Maximum height (metres) <span className="text-red-500">*</span></label>
            <input id="ob-height" type="number" min="0.5" max="15" step="0.1" value={data.structureHeight} onChange={(e) => onChange("structureHeight", e.target.value)} required placeholder="e.g. 3.5" className={inputClass} />
            <p className="mt-1 text-xs text-gray-400">Highest point of the structure from ground level.</p>
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="ob-protected">Is the house a protected structure or in an Architectural Conservation Area (ACA)? <span className="text-red-500">*</span></label>
          <select id="ob-protected" value={data.protectedStructure} onChange={(e) => onChange("protectedStructure", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select…</option>
            <option value="no">No</option>
            <option value="yes">Yes — it is a protected structure or in an ACA</option>
            <option value="unsure">Unsure — I have not checked</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="ob-details">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea id="ob-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={3} placeholder="e.g. Detached timber shed in rear garden, set back 1m from boundary wall. No previous outbuildings on the property." className={inputClass + " resize-none leading-relaxed"} />
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
          {loading ? <><Spinner />Analysing your project…</> : "Check planning permission"}
        </button>
      </form>
    </div>
  );
}

// ─── Change of Appearance Form ─────────────────────────────────────────────────

const APPEARANCE_TYPES = ["External Wall Insulation (ETICS)","Stone Cladding","Render or Roughcast","Window Replacement","Door Replacement","Solar PV Panels","Solar Thermal Panels","Roof Material Change","Repainting Exterior","Other External Works"];

function AppearanceForm({ data, onChange, onBack, onSubmit, loading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; onBack: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" /></svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900">Change of Appearance</h2>
        </div>
        <p className="text-sm text-gray-500">Changes to the external appearance of your home may or may not require planning permission. This tool checks whether your proposed works need consent.</p>
      </div>
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="ap-county">County <span className="text-red-500">*</span></label>
            <select id="ap-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select a county…</option>
              {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ap-type">Type of works <span className="text-red-500">*</span></label>
            <select id="ap-type" value={data.appearanceType} onChange={(e) => onChange("appearanceType", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              {APPEARANCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="ap-protected">Is the house a protected structure or in an Architectural Conservation Area (ACA)? <span className="text-red-500">*</span></label>
          <select id="ap-protected" value={data.protectedStructure} onChange={(e) => onChange("protectedStructure", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select…</option>
            <option value="no">No</option>
            <option value="yes">Yes — it is a protected structure or in an ACA</option>
            <option value="unsure">Unsure — I have not checked</option>
          </select>
          <p className="mt-1.5 text-xs text-gray-400">Protected structures require permission for most external works. Check your local authority&apos;s Record of Protected Structures.</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="ap-details">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea id="ap-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={3} placeholder="e.g. Semi-detached house in an estate. Replacing original timber windows with uPVC. No previous external alterations." className={inputClass + " resize-none leading-relaxed"} />
          <p className="mt-1.5 text-xs text-gray-400">Include house type, materials used, and whether works affect the front or rear elevation.</p>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
          {loading ? <><Spinner />Analysing your project…</> : "Check planning permission"}
        </button>
      </form>
    </div>
  );
}

// ─── Agricultural and Rural Works Form ────────────────────────────────────────

const AGRICULTURAL_TYPES = ["Cattle Grid (installation or removal)","Farm Building (shed, barn, milking parlour)","Silage Pit or Slurry Storage Tank","New Farm Access Road or Entrance","Land Drainage Works","Other Agricultural Works"];

function AgriculturalForm({ data, onChange, onBack, onSubmit, loading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; onBack: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" /></svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900">Agricultural and Rural Works</h2>
        </div>
        <p className="text-sm text-gray-500">Agricultural development has specific exempted development provisions under Irish planning law. This tool assesses whether your proposed works require planning permission.</p>
      </div>
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="ag-county">County <span className="text-red-500">*</span></label>
            <select id="ag-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select a county…</option>
              {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ag-type">Type of works <span className="text-red-500">*</span></label>
            <select id="ag-type" value={data.agriculturalType} onChange={(e) => onChange("agriculturalType", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              {AGRICULTURAL_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass}>Is this on a working farm? <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-400 mb-1">Agricultural exemptions apply only to genuine farming operations. Non-farm landowners do not benefit from these exemptions.</p>
          <YesNoToggle value={data.isFarmer} onChange={(v) => onChange("isFarmer", v)} />
        </div>
        <div>
          <label className={labelClass} htmlFor="ag-details">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea id="ag-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={3} placeholder="e.g. Beef and tillage farm of 80 hectares. Proposing to build a new 300 sqm storage shed 200m from the road. No Natura 2000 sites nearby." className={inputClass + " resize-none leading-relaxed"} />
          <p className="mt-1.5 text-xs text-gray-400">Farm size, proximity to roads and watercourses, and distance from Natura 2000 sites all affect the assessment.</p>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
          {loading ? <><Spinner />Analysing your project…</> : "Check planning requirements"}
        </button>
      </form>
    </div>
  );
}

// ─── Change of Use Form ────────────────────────────────────────────────────────

const CURRENT_USES = ["Residential Garage or Outbuilding","Ground Floor Commercial or Retail","Office","Industrial or Warehouse","Agricultural Building","Part of Existing House","Other"];
const PROPOSED_USES = ["Additional Living Space (connected to house)","Separate Residential Dwelling Unit","Home Office or Studio","Short-Term Holiday Rental (e.g. Airbnb)","Commercial or Retail Use","Other Use"];

function ChangeOfUseForm({ data, onChange, onBack, onSubmit, loading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; onBack: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900">Change of Use</h2>
        </div>
        <p className="text-sm text-gray-500">Changing how a building is used often requires planning permission. This tool assesses whether your proposed change of use requires formal planning consent under Irish law.</p>
      </div>
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div>
          <label className={labelClass} htmlFor="cu-county">County <span className="text-red-500">*</span></label>
          <select id="cu-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select a county…</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="cu-current">Current use of building <span className="text-red-500">*</span></label>
            <select id="cu-current" value={data.currentUse} onChange={(e) => onChange("currentUse", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              {CURRENT_USES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="cu-proposed">Proposed use <span className="text-red-500">*</span></label>
            <select id="cu-proposed" value={data.proposedUse} onChange={(e) => onChange("proposedUse", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              {PROPOSED_USES.map((u) => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="cu-protected">Is the building a protected structure or in an Architectural Conservation Area (ACA)? <span className="text-red-500">*</span></label>
          <select id="cu-protected" value={data.protectedStructure} onChange={(e) => onChange("protectedStructure", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select…</option>
            <option value="no">No</option>
            <option value="yes">Yes — it is a protected structure or in an ACA</option>
            <option value="unsure">Unsure — I have not checked</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="cu-details">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea id="cu-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={3} placeholder="e.g. Attached garage (30 sqm) to be converted to a home office. No change to external structure. Built in 1995." className={inputClass + " resize-none leading-relaxed"} />
          <p className="mt-1.5 text-xs text-gray-400">Whether the building is integral, attached, or detached, its floor area, and any proposed external changes all affect the assessment.</p>
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
          {loading ? <><Spinner />Analysing your project…</> : "Check planning permission"}
        </button>
      </form>
    </div>
  );
}

// ─── Other Works Form ──────────────────────────────────────────────────────────

function OtherWorksForm({ data, onChange, onBack, onSubmit, loading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; onBack: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L3 3l1.5 1.5 3.75.75 5.91 5.91" /></svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900">Other Works</h2>
        </div>
        <p className="text-sm text-gray-500">If your works don&apos;t fit the other categories, describe what you plan to do and we&apos;ll assess whether planning permission may be required under Irish law.</p>
      </div>
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div>
          <label className={labelClass} htmlFor="ow-county">County <span className="text-red-500">*</span></label>
          <select id="ow-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select a county…</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="ow-desc">Describe the works you are proposing <span className="text-red-500">*</span></label>
          <textarea id="ow-desc" value={data.worksDescription} onChange={(e) => onChange("worksDescription", e.target.value)} rows={4} required placeholder="e.g. I want to create a new vehicular entrance from my rear garden onto a public road. The entrance would be gated and approximately 3m wide." className={inputClass + " resize-none leading-relaxed"} />
          <p className="mt-1.5 text-xs text-gray-400">Be as specific as possible — include the type of works, materials, dimensions, and location on your property.</p>
        </div>
        <div>
          <label className={labelClass} htmlFor="ow-protected">Is the property a protected structure or in an Architectural Conservation Area (ACA)?</label>
          <select id="ow-protected" value={data.protectedStructure} onChange={(e) => onChange("protectedStructure", e.target.value)} className={inputClass + " appearance-none cursor-pointer"}>
            <option value="">Not specified / unsure</option>
            <option value="no">No</option>
            <option value="yes">Yes — it is a protected structure or in an ACA</option>
            <option value="unsure">Unsure — I have not checked</option>
          </select>
        </div>
        <div>
          <label className={labelClass} htmlFor="ow-details">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea id="ow-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={3} placeholder="Any other relevant context…" className={inputClass + " resize-none leading-relaxed"} />
        </div>
        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
          {loading ? <><Spinner />Analysing your project…</> : "Check planning permission"}
        </button>
      </form>
    </div>
  );
}

// ─── Retention Form ────────────────────────────────────────────────────────────

const RETENTION_WORKS_TYPES = ["Extension to House","New Outbuilding or Structure","Alteration to External Appearance","Change of Use","New Dwelling or Build","Internal Alterations","Other Works"];
const RETENTION_DATES = ["Within the last year","1–3 years ago","3–7 years ago","More than 7 years ago","Unsure"];

function RetentionForm({ data, onChange, onBack, onSubmit, loading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; onBack: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean }) {
  const enforcementActive = data.retentionEnforcement === "yes";
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 text-amber-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900">Retention Permission</h2>
        </div>
        <p className="text-sm text-gray-500">Retention permission is a retrospective application to regularise works already carried out without planning permission. It is assessed on the same planning merits as a prospective application — it is not a guaranteed route to regularisation.</p>
      </div>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 flex gap-3 mb-6">
        <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
        <div>
          <p className="text-sm font-semibold text-amber-800 mb-1">Retention carries real legal and financial risk</p>
          <p className="text-xs text-amber-700 leading-relaxed">Works refused retention can result in enforcement action including a requirement to demolish or restore the property to its original condition. If you have received any correspondence from your local authority, seek professional planning advice immediately before taking any further steps.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div>
          <label className={labelClass} htmlFor="ret-county">County <span className="text-red-500">*</span></label>
          <select id="ret-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select a county…</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="ret-type">Type of works carried out <span className="text-red-500">*</span></label>
            <select id="ret-type" value={data.retentionWorksType} onChange={(e) => onChange("retentionWorksType", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              {RETENTION_WORKS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ret-date">When were the works carried out? <span className="text-red-500">*</span></label>
            <select id="ret-date" value={data.retentionWorksDate} onChange={(e) => onChange("retentionWorksDate", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              {RETENTION_DATES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <p className="mt-1 text-xs text-gray-400">A 7-year enforcement time limit generally applies but does not guarantee retention.</p>
          </div>
        </div>

        <div>
          <label className={labelClass}>Are the works clearly visible from a public road? <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-400 mb-1">Visible works are more likely to have attracted neighbour objections or local authority attention.</p>
          <YesNoToggle value={data.retentionVisible} onChange={(v) => onChange("retentionVisible", v)} />
        </div>

        <div>
          <label className={labelClass}>Has the local authority contacted you about these works? <span className="text-red-500">*</span></label>
          <p className="text-xs text-gray-400 mb-1">This includes warning letters, enforcement notices, or any other official correspondence.</p>
          <YesNoToggle value={data.retentionEnforcement} onChange={(v) => onChange("retentionEnforcement", v)} />
        </div>

        {enforcementActive && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            <div>
              <p className="text-sm font-semibold text-red-800 mb-1">Enforcement proceedings may be active — act immediately</p>
              <p className="text-xs text-red-700 leading-relaxed">If you have received formal correspondence from your local authority, you should consult a planning consultant or solicitor as a matter of urgency. Do not rely on this tool alone — time limits on responses to enforcement notices are strict.</p>
            </div>
          </div>
        )}

        <div>
          <label className={labelClass} htmlFor="ret-protected">Is the property a protected structure or in an Architectural Conservation Area (ACA)? <span className="text-red-500">*</span></label>
          <select id="ret-protected" value={data.protectedStructure} onChange={(e) => onChange("protectedStructure", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select…</option>
            <option value="no">No</option>
            <option value="yes">Yes — it is a protected structure or in an ACA</option>
            <option value="unsure">Unsure — I have not checked</option>
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="ret-details">Describe the works carried out <span className="text-red-500">*</span></label>
          <textarea id="ret-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={4} required placeholder="e.g. Built a single-storey rear extension of approximately 25 sqm to a semi-detached house. Works completed in 2023. No planning permission was obtained at the time." className={inputClass + " resize-none leading-relaxed"} />
          <p className="mt-1.5 text-xs text-gray-400">Be specific about what was built, approximate dimensions, materials, and any relevant context. The more detail you provide, the more useful the AI assessment will be.</p>
        </div>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
          {loading ? <><Spinner />Analysing your situation…</> : "Assess retention prospects"}
        </button>
      </form>
    </div>
  );
}

// ─── Protected Structure Form ──────────────────────────────────────────────────

const PS_WORKS_TYPES = ["Sympathetic Repair or Restoration","Window or Door Replacement","Roof Works or Re-Roofing","Internal Alterations","External Alterations or Cladding","Extension","Partial or Full Demolition","Change of Use","Structural Works","Other Works"];
const PS_STRUCTURE_TYPES = ["Residential House or Cottage","Commercial or Retail Premises","Agricultural or Industrial Building","Religious Building (church, chapel)","Civic or Institutional Building","Other"];

function ProtectedStructureForm({ data, onChange, onBack, onSubmit, loading }: { data: FormData; onChange: (f: keyof FormData, v: string) => void; onBack: () => void; onSubmit: (e: React.FormEvent) => void; loading: boolean }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-100 text-green-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
          </span>
          <h2 className="text-xl font-bold text-gray-900">Protected Structure</h2>
        </div>
        <p className="text-sm text-gray-500">Works to a building on the Record of Protected Structures require planning permission even for works that would normally be exempt. The standard exempted development rules do not apply.</p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex gap-3 mb-6">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>
        <div>
          <p className="text-sm font-semibold text-blue-800 mb-1">A conservation architect is strongly recommended</p>
          <p className="text-xs text-blue-700 leading-relaxed">Works to protected structures almost always require input from an architect with conservation accreditation (RIAI Conservation Accreditation Scheme or equivalent). Pre-planning consultation with your local authority&apos;s conservation officer is also strongly advised before lodging any application.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 lg:p-8 space-y-6 shadow-sm">
        <div>
          <label className={labelClass} htmlFor="ps-county">County <span className="text-red-500">*</span></label>
          <select id="ps-county" value={data.county} onChange={(e) => onChange("county", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
            <option value="" disabled>Select a county…</option>
            {COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="ps-works">Type of proposed works <span className="text-red-500">*</span></label>
            <select id="ps-works" value={data.psWorksType} onChange={(e) => onChange("psWorksType", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              {PS_WORKS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={labelClass} htmlFor="ps-structure">Nature of the structure <span className="text-red-500">*</span></label>
            <select id="ps-structure" value={data.psStructureType} onChange={(e) => onChange("psStructureType", e.target.value)} required className={inputClass + " appearance-none cursor-pointer"}>
              <option value="" disabled>Select…</option>
              {PS_STRUCTURE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="ps-details">Additional details <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea id="ps-details" value={data.additionalDetails} onChange={(e) => onChange("additionalDetails", e.target.value)} rows={4} placeholder="e.g. Georgian terraced house listed on the RPS. Proposing to replace original timber sash windows with double-glazed timber replicas of the same design and proportions. No other external changes proposed." className={inputClass + " resize-none leading-relaxed"} />
          <p className="mt-1.5 text-xs text-gray-400">Include the approximate age or period of the structure, materials involved, and whether the works are reversible. The more detail you provide, the more useful the AI assessment will be.</p>
        </div>

        <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 sm:py-3.5 px-6 rounded-xl transition-colors text-sm">
          {loading ? <><Spinner />Analysing your project…</> : "Assess protected structure works"}
        </button>
      </form>
    </div>
  );
}

// ─── Result Panel ──────────────────────────────────────────────────────────────

const FLOW_TO_GRANT_TYPE: Partial<Record<FlowType, GrantFlowType>> = {
  "new-build":   "new-build",
  "extension":   "extension",
  "appearance":  "appearance",
  "replacement": "replacement",
};

// Profession types most relevant for each flow — used to pre-filter the directory
const FLOW_TO_PROFESSIONS: Partial<Record<FlowType, ProfessionType>> = {
  "new-build":          "planning_consultant",
  "extension":          "architect",
  "replacement":        "planning_consultant",
  "outbuildings":       "architectural_technologist",
  "appearance":         "architectural_technologist",
  "agricultural":       "land_agent",
  "change-of-use":      "planning_consultant",
  "other-works":        "planning_consultant",
  "retention":          "planning_consultant",
  "protected-structure":"architect",
};

function FindAProfessionalPrompt({ county, flowType }: { county: string; flowType: FlowType }) {
  const profType = FLOW_TO_PROFESSIONS[flowType];
  const params = new URLSearchParams();
  if (county) params.set("county", county);
  if (profType) params.set("type", profType);
  const href = `/find-a-professional?${params}`;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 mt-5">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">You will need a qualified professional to submit this application</p>
          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
            Planning applications in Ireland must be prepared and certified by a qualified professional. Find an architect, planning consultant or specialist
            {county ? ` in Co. ${county}` : ""} in our free directory.
          </p>
        </div>
      </div>
      <a
        href={href}
        className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold py-2.5 px-4 rounded-xl transition-colors"
      >
        Find a professional{county ? ` in Co. ${county}` : ""}
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
      </a>
    </div>
  );
}

function ResultPanel({ result, flowType, county, onReset }: { result: CheckPermissionResult; flowType: FlowType; county: string; onReset: () => void }) {
  const config = OUTCOME_CONFIG[result.outcome];
  const label = OUTCOME_LABELS[flowType][result.outcome];
  const grantFlowType = FLOW_TO_GRANT_TYPE[flowType];
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

      {/* Inline AI notice */}
      <div className="mt-5 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        <p className="text-sm text-amber-800 leading-relaxed">
          <strong className="font-semibold">AI-generated guidance only.</strong>{" "}
          This result is produced by an AI model and may not reflect your full circumstances. For complex or high-value projects, always verify with a registered architect or your local planning authority before committing to works or expenditure.
        </p>
      </div>

      {/* Why this answer — regulation reference */}
      {FLOW_REGULATION_REFS[flowType] && (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-4 h-4 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.966 8.966 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Why this answer</p>
              <p className="text-sm font-semibold text-gray-900 mb-1">{FLOW_REGULATION_REFS[flowType]!.ref}</p>
              <p className="text-sm text-gray-600 leading-relaxed">{FLOW_REGULATION_REFS[flowType]!.detail}</p>
            </div>
          </div>
        </div>
      )}

      {grantFlowType && (
        <GrantsAlert flowType={grantFlowType} className="mt-5" />
      )}
      <FindAProfessionalPrompt county={county} flowType={flowType} />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

const IS_DEMO = isDemoMode();

export default function CheckPage() {
  const { isPaid } = useAuthStatus();
  const [step, setStep] = useState<PageStep>("select");
  const [flowType, setFlowType] = useState<FlowType | null>(null);
  const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckPermissionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle scenario pre-fill from URL params (demo: instant result; live: pre-fill form)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const scenario = params.get("scenario");
    if (!scenario || !(scenario in DEMO_SCENARIO_RESULTS)) return;
    const { flowType: ft, county, result: scenarioResult } = DEMO_SCENARIO_RESULTS[scenario];
    setFlowType(ft as FlowType);
    setFormData((prev) => ({ ...prev, county }));
    if (IS_DEMO) {
      setResult(scenarioResult as CheckPermissionResult);
      setStep("result");
    } else {
      setStep("form");
    }
  }, []);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const res = await fetch("/api/check-permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flowType, ...formData }),
      });
      let data: Record<string, unknown>;
      try {
        data = await res.json();
      } catch {
        setError("The server returned an unexpected response. Please try again.");
        return;
      }
      if (!res.ok) {
        setError((data.error as string) ?? "Something went wrong. Please try again.");
        return;
      }
      setResult(data as unknown as CheckPermissionResult);
      setStep("result");
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell focusedMode={step !== "select"} onBack={step !== "select" ? handleBack : undefined}>

      {/* Full-page loading overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
          <svg className="animate-spin h-10 w-10 text-green-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-sm font-semibold text-gray-700">Analysing your project…</p>
          <p className="text-xs text-gray-400 mt-1">This usually takes 5–10 seconds</p>
        </div>
      )}

      <div className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 max-w-3xl mx-auto">

        {/* Prominent error banner */}
        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 mb-0.5">Something went wrong</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {step === "select" && <FlowSelector onSelect={handleFlowSelect} county={formData.county} onCountyChange={(c) => handleFieldChange("county", c)} />}

        {step === "form" && flowType === "new-build" && (
          <NewBuildForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "extension" && (
          <ExtensionForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "replacement" && (
          <ReplacementForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "outbuildings" && (
          <OutbuildingsForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "appearance" && (
          <AppearanceForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "agricultural" && (
          <AgriculturalForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "change-of-use" && (
          <ChangeOfUseForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "other-works" && (
          <OtherWorksForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "retention" && (
          <RetentionForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}
        {step === "form" && flowType === "protected-structure" && (
          <ProtectedStructureForm data={formData} onChange={handleFieldChange} onBack={handleBack} onSubmit={handleSubmit} loading={loading} />
        )}

        {step === "result" && result && flowType && (
          <ResultPanel result={result} flowType={flowType} county={formData.county} onReset={handleReset} />
        )}

        {/* County intelligence panel — shown during form step when county is selected */}
        {step === "form" && formData.county && (
          <CountyIntelPanel county={formData.county} isPaid={isPaid} className="mt-5" />
        )}

        <LegalDisclaimer className="mt-8 sm:mt-10" />

      </div>
    </AppShell>
  );
}
