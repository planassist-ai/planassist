"use client";

import { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/app/components/AppShell";
import { UpgradePrompt } from "@/app/components/UpgradePrompt";
import { LegalDisclaimer } from "@/app/components/LegalDisclaimer";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";

// ─── Types ────────────────────────────────────────────────────────────────────

type StageStatus = "not-started" | "in-progress" | "complete";
type FundingType = "mortgage" | "self-funded";

interface SelfBuildProject {
  planningRef: string;
  county: string;
  projectType: string;
  startDate: string;
  fundingType: FundingType;
  createdAt: string;
}

interface ChecklistItemDef {
  id: string;
  label: string;
  hasDocument?: boolean;
}

interface StageDef {
  id: string;
  label: string;
  shortLabel: string;
  items: ChecklistItemDef[];
  drawdownStage?: number; // 1–5 if this stage triggers a bank drawdown
}

interface StageState {
  status: StageStatus;
  checkedItems: Record<string, boolean>;
  documentNames: Record<string, string>; // itemId → filename
}

interface SelfBuildData {
  project: SelfBuildProject;
  stages: Record<string, StageState>;
  notification: string | null;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "granted_selfbuild_v1";
const STORAGE_KEY_LEGACY = "planr_selfbuild_v1";

const COUNTIES = [
  "Carlow","Cavan","Clare","Cork","Donegal","Dublin","Galway","Kerry",
  "Kildare","Kilkenny","Laois","Leitrim","Limerick","Longford","Louth",
  "Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo","Tipperary",
  "Waterford","Westmeath","Wexford","Wicklow",
];

const PROJECT_TYPES = [
  "One-off rural dwelling",
  "Suburban / urban new build",
  "Replacement dwelling",
  "Self-build extension",
];

const STAGES: StageDef[] = [
  {
    id: "planning-complete",
    label: "Planning Complete",
    shortLabel: "Planning",
    items: [
      { id: "grant-letter", label: "Grant letter / decision received from planning authority", hasDocument: true },
      { id: "conditions-reviewed", label: "All planning conditions reviewed and understood" },
      { id: "dev-contribution", label: "Development contribution amount noted and funds planned for" },
      { id: "appeal-period", label: "28-day appeal period confirmed as passed (or An Bord Pleanála appeal lodged)" },
      { id: "solicitor-noted", label: "Solicitor notified of planning grant (if mortgage)" },
    ],
  },
  {
    id: "pre-commencement",
    label: "Pre-Commencement",
    shortLabel: "Pre-Comm.",
    drawdownStage: 1,
    items: [
      { id: "commencement-notice", label: "Commencement notice submitted to Building Control Authority (minimum 14 days before start)", hasDocument: true },
      { id: "assigned-certifier", label: "Assigned Certifier appointed and notice submitted to BCMS", hasDocument: true },
      { id: "bcms-registered", label: "Project registered on BCMS (Building Control Management System)", hasDocument: true },
      { id: "pre-comm-conditions", label: "Pre-commencement planning conditions discharged (e.g. archaeology, bat survey)", hasDocument: true },
      { id: "dev-contribution-paid", label: "Development contribution paid to local authority", hasDocument: true },
      { id: "planning-levy", label: "Planning levy / Uisce Éireann connection charge paid or agreed" },
      { id: "boundary-survey", label: "Site survey and boundary pegging completed by engineer / surveyor" },
      { id: "mortgage-drawdown-1", label: "Mortgage stage 1 drawdown documents submitted to bank (if applicable)", hasDocument: true },
    ],
  },
  {
    id: "foundation",
    label: "Foundation",
    shortLabel: "Foundation",
    items: [
      { id: "site-set-out", label: "Site set out and cleared" },
      { id: "foundation-design", label: "Foundation design approved by engineer" },
      { id: "soil-test", label: "Percolation / soil test completed (if applicable for wastewater)" },
      { id: "foundations-poured", label: "Foundations excavated and poured" },
      { id: "foundation-inspection", label: "Foundation stage inspection by Assigned Certifier", hasDocument: true },
      { id: "dpc-installed", label: "DPC (damp proof course) installed" },
      { id: "ground-floor", label: "Ground floor slab or beam & block installed" },
      { id: "services-stub", label: "Underground services (water, ESB, waste) stubbed in before slab" },
    ],
  },
  {
    id: "wallplate",
    label: "Wallplate",
    shortLabel: "Wallplate",
    drawdownStage: 2,
    items: [
      { id: "walls-rising", label: "Walls rising — blockwork / timber frame / ICF to wallplate level" },
      { id: "insulation-cavity", label: "Cavity insulation installed to correct specification" },
      { id: "lintels-beams", label: "All lintels and structural beams installed" },
      { id: "wallplate-inspection", label: "Wallplate level inspection by Assigned Certifier", hasDocument: true },
      { id: "esb-application", label: "ESB Networks connection application submitted", hasDocument: true },
      { id: "irish-water-app", label: "Irish Water connection application submitted (if mains water)", hasDocument: true },
      { id: "mortgage-drawdown-2", label: "Mortgage stage 2 drawdown documents submitted to bank (if applicable)", hasDocument: true },
    ],
  },
  {
    id: "roof",
    label: "Roof",
    shortLabel: "Roof",
    drawdownStage: 3,
    items: [
      { id: "roof-structure", label: "Roof structure erected (cut roof / attic trusses)" },
      { id: "roof-felt-batten", label: "Roofing felt, battens and counter-battens installed" },
      { id: "roof-covering", label: "Roof covering (tiles, slates, standing seam) complete" },
      { id: "weathertight", label: "Building weathertight — all windows and external doors installed" },
      { id: "roof-inspection", label: "Roof / weathertight stage inspection by Assigned Certifier", hasDocument: true },
      { id: "radon-sump", label: "Radon sump and membrane installed below slab (required in high-risk areas)" },
      { id: "mortgage-drawdown-3", label: "Mortgage stage 3 drawdown documents submitted to bank (if applicable)", hasDocument: true },
    ],
  },
  {
    id: "first-fix",
    label: "First Fix",
    shortLabel: "First Fix",
    drawdownStage: 4,
    items: [
      { id: "plumbing-first-fix", label: "Plumbing first fix — all pipes run before boarding" },
      { id: "electrical-first-fix", label: "Electrical first fix — cables run, consumer unit positioned" },
      { id: "mhvr-hvac", label: "MHRV / HVAC system ducting installed (if applicable)" },
      { id: "insulation-walls", label: "Internal wall and attic insulation installed to specification" },
      { id: "airtightness-layer", label: "Airtightness membrane / layer installed and taped" },
      { id: "ber-assessor-first", label: "BER assessor engaged and initial visit / measurements completed" },
      { id: "first-fix-inspection", label: "First fix stage inspection by Assigned Certifier", hasDocument: true },
      { id: "mortgage-drawdown-4", label: "Mortgage stage 4 drawdown documents submitted to bank (if applicable)", hasDocument: true },
    ],
  },
  {
    id: "second-fix",
    label: "Second Fix",
    shortLabel: "Second Fix",
    items: [
      { id: "plasterboard", label: "Plasterboard and plastering complete" },
      { id: "plumbing-second-fix", label: "Plumbing second fix — sanitaryware, shower, cylinder fitted" },
      { id: "electrical-second-fix", label: "Electrical second fix — sockets, switches, lights, RCD tested" },
      { id: "heating-system", label: "Heating system (heat pump / boiler / underfloor) commissioned" },
      { id: "kitchen-joinery", label: "Kitchen and internal joinery fitted" },
      { id: "flooring", label: "Floor finishes installed (tile, timber, vinyl)" },
      { id: "painting", label: "Internal painting and decorating complete" },
      { id: "ber-assessor-final", label: "BER assessor final visit and assessment submitted", hasDocument: true },
    ],
  },
  {
    id: "completion",
    label: "Completion",
    shortLabel: "Completion",
    drawdownStage: 5,
    items: [
      { id: "ber-cert", label: "BER certificate received (Building Energy Rating)", hasDocument: true },
      { id: "final-inspection", label: "Final inspection by Assigned Certifier", hasDocument: true },
      { id: "ccc", label: "Certificate of Compliance on Completion (CCC) issued and lodged with BCMS", hasDocument: true },
      { id: "snag-list", label: "Snagging list completed and signed off with builder" },
      { id: "esb-final", label: "ESB final meter connection and electricity energised" },
      { id: "irish-water-final", label: "Irish Water connection confirmed live (if mains water)" },
      { id: "broadband", label: "Broadband / telecom connection arranged" },
      { id: "home-insurance", label: "Home insurance arranged" },
      { id: "mortgage-drawdown-5", label: "Mortgage final drawdown submitted — final valuation and CCC to bank", hasDocument: true },
      { id: "revenue-relief", label: "Revenue Help-to-Buy / mortgage interest relief applied for (if applicable)", hasDocument: true },
    ],
  },
];

const BANK_DRAWDOWN_STAGES = [
  {
    stage: 1,
    stageLabel: "Stage 1 — Pre-Commencement",
    description: "Submitted before work begins, usually to release land purchase funds or initial draw.",
    documents: [
      "Signed solicitor's certificate of title",
      "Copy of planning permission / grant letter",
      "Commencement notice (Building Control Authority acknowledgement)",
      "Structural engineer's confirmation of site suitability",
      "Development contribution receipt (if paid)",
      "Assigned Certifier appointment letter",
    ],
  },
  {
    stage: 2,
    stageLabel: "Stage 2 — Wallplate Level",
    description: "Released when walls reach wallplate level, verified by a bank-appointed valuer.",
    documents: [
      "Quantity surveyor's stage certification (confirming wallplate level reached)",
      "Structural engineer's stage inspection report",
      "Solicitor's certificate (confirming no encumbrances)",
      "Bank valuer's inspection report",
      "Receipts / invoices for work completed to date",
    ],
  },
  {
    stage: 3,
    stageLabel: "Stage 3 — Roof / Weathertight",
    description: "Released when the building is fully weathertight with windows and doors installed.",
    documents: [
      "Quantity surveyor's stage certification (confirming weathertight)",
      "Structural engineer's stage inspection report",
      "Bank valuer's updated inspection report",
      "Receipts / invoices for work completed to date",
    ],
  },
  {
    stage: 4,
    stageLabel: "Stage 4 — First Fix Complete",
    description: "Released when plumbing, electrical first fix and insulation are in place.",
    documents: [
      "Quantity surveyor's stage certification (confirming first fix complete)",
      "Engineer's inspection report",
      "Bank valuer's inspection report",
      "Receipts / invoices for work completed to date",
    ],
  },
  {
    stage: 5,
    stageLabel: "Stage 5 — Completion / Final Drawdown",
    description: "Final release on practical completion. The most document-intensive stage.",
    documents: [
      "Certificate of Compliance on Completion (CCC) — mandatory",
      "BER certificate — mandatory",
      "Final bank valuation report",
      "Solicitor's final certificate of title",
      "Snag list sign-off from builder",
      "All planning condition discharge letters",
      "Structural engineer's completion certificate",
      "Electrical installation certificate",
      "Plumbing / gas installation certificate",
      "BCMS compliance confirmation",
    ],
  },
];

const PORTAL_LINKS = [
  {
    label: "BCMS Online",
    description: "Register your project, submit commencement notices and file completion certificates",
    url: "https://www.bcmsireland.ie",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    ),
  },
  {
    label: "ESB Networks",
    description: "Apply for a new electricity connection for your self-build",
    url: "https://www.esbnetworks.ie/new-connections",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
  },
  {
    label: "Irish Water",
    description: "Apply for a new water connection or domestic connection upgrade",
    url: "https://www.water.ie/connections",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c0 0-7.5 8.25-7.5 13.5a7.5 7.5 0 0015 0C19.5 10.5 12 2.25 12 2.25z" />
      </svg>
    ),
  },
  {
    label: "Revenue — Help to Buy",
    description: "Apply for Help-to-Buy relief on your new self-build home (income tax refund up to €30,000)",
    url: "https://www.revenue.ie/en/property/help-to-buy-incentive/index.aspx",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
      </svg>
    ),
  },
];

// ─── localStorage helpers ─────────────────────────────────────────────────────

function loadData(): SelfBuildData | null {
  if (typeof window === "undefined") return null;
  try {
    // Migrate data from old storage key if present
    const legacy = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (legacy) {
      localStorage.setItem(STORAGE_KEY, legacy);
      localStorage.removeItem(STORAGE_KEY_LEGACY);
      return JSON.parse(legacy) as SelfBuildData;
    }
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SelfBuildData;
  } catch {
    return null;
  }
}

function saveData(data: SelfBuildData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function buildInitialStages(): Record<string, StageState> {
  const stages: Record<string, StageState> = {};
  for (const s of STAGES) {
    stages[s.id] = { status: "not-started", checkedItems: {}, documentNames: {} };
  }
  return stages;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: StageStatus }) {
  if (status === "complete") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
        Complete
      </span>
    );
  }
  if (status === "in-progress") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
        <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
        In Progress
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500">
      <span className="w-2 h-2 rounded-full bg-gray-300" />
      Not Started
    </span>
  );
}

function StageIcon({ index, status }: { index: number; status: StageStatus }) {
  const base = "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors";
  if (status === "complete") {
    return (
      <div className={`${base} bg-green-600 border-green-600 text-white`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>
    );
  }
  if (status === "in-progress") {
    return <div className={`${base} bg-amber-50 border-amber-400 text-amber-700`}>{index + 1}</div>;
  }
  return <div className={`${base} bg-white border-gray-300 text-gray-400`}>{index + 1}</div>;
}

interface SetupFormProps {
  onSetup: (project: SelfBuildProject) => void;
}

function SetupForm({ onSetup }: SetupFormProps) {
  const [planningRef, setPlanningRef] = useState("");
  const [county, setCounty] = useState("");
  const [projectType, setProjectType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [fundingType, setFundingType] = useState<FundingType>("mortgage");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!county || !projectType) {
      setError("Please select a county and project type.");
      return;
    }
    setError(null);
    onSetup({
      planningRef: planningRef.trim(),
      county,
      projectType,
      startDate,
      fundingType,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-green-50 border border-green-100 mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Self-Build Tracker</h1>
        <p className="text-sm text-gray-500 leading-relaxed">
          Track your self-build journey from planning grant to completion. Set up your project to get started.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Planning Reference Number</label>
          <input
            type="text"
            value={planningRef}
            onChange={e => setPlanningRef(e.target.value)}
            placeholder="e.g. PL12/12345"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-400 mt-1">Optional — found on your grant letter</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">County <span className="text-red-500">*</span></label>
          <select
            value={county}
            onChange={e => setCounty(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="">Select county…</option>
            {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Project Type <span className="text-red-500">*</span></label>
          <select
            value={projectType}
            onChange={e => setProjectType(e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          >
            <option value="">Select project type…</option>
            {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Expected Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">How are you funding the build?</label>
          <div className="grid grid-cols-2 gap-3">
            {(["mortgage", "self-funded"] as FundingType[]).map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFundingType(f)}
                className={`px-4 py-3 rounded-xl border text-sm font-medium text-center transition-colors ${
                  fundingType === f
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {f === "mortgage" ? "Mortgage / Stage Loan" : "Self-Funded / Cash"}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors"
        >
          Start Tracking My Build
        </button>
      </form>
    </div>
  );
}

// ─── Stage card ───────────────────────────────────────────────────────────────

interface StageCardProps {
  stage: StageDef;
  index: number;
  stageState: StageState;
  isMortgage: boolean;
  county: string;
  onToggleItem: (stageId: string, itemId: string) => void;
  onUpdateDocument: (stageId: string, itemId: string, name: string) => void;
  onSetStatus: (stageId: string, status: StageStatus) => void;
}

function StageCard({ stage, index, stageState, isMortgage, county, onToggleItem, onUpdateDocument, onSetStatus }: StageCardProps) {
  const [expanded, setExpanded] = useState(stageState.status === "in-progress");

  const visibleItems = stage.items.filter(item => {
    // hide mortgage drawdown items if self-funded
    if (!isMortgage && item.id.startsWith("mortgage-drawdown")) return false;
    return true;
  });

  const checkedCount = visibleItems.filter(item => stageState.checkedItems[item.id]).length;
  const totalCount = visibleItems.length;
  const allChecked = checkedCount === totalCount && totalCount > 0;

  return (
    <div className={`rounded-2xl border transition-colors ${
      stageState.status === "complete"
        ? "border-green-200 bg-green-50"
        : stageState.status === "in-progress"
        ? "border-amber-200 bg-white"
        : "border-gray-200 bg-white"
    }`}>
      {/* Card header */}
      <button
        type="button"
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-4 p-4 sm:p-5 text-left"
      >
        <StageIcon index={index} status={stageState.status} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-900">{stage.label}</h3>
            {stage.drawdownStage && isMortgage && (
              <span className="text-xs bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded-full">
                Bank drawdown
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{checkedCount} of {totalCount} tasks complete</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={stageState.status} />
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="px-5 pb-1">
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${(checkedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded checklist */}
      {expanded && (
        <div className="px-4 sm:px-5 pb-5 pt-3 space-y-3">
          {visibleItems.map(item => (
            <div key={item.id} className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => onToggleItem(stage.id, item.id)}
                className={`w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                  stageState.checkedItems[item.id]
                    ? "bg-green-600 border-green-600"
                    : "border-gray-300 hover:border-green-400"
                }`}
              >
                {stageState.checkedItems[item.id] && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed ${
                  stageState.checkedItems[item.id] ? "line-through text-gray-400" : "text-gray-700"
                }`}>
                  {item.label}
                </p>
                {item.hasDocument && (
                  <div className="mt-1.5 flex items-center gap-2">
                    {stageState.documentNames[item.id] ? (
                      <div className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-2.5 py-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="max-w-[180px] truncate">{stageState.documentNames[item.id]}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateDocument(stage.id, item.id, "")}
                          className="ml-0.5 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-700 cursor-pointer border border-dashed border-gray-300 hover:border-green-400 rounded-lg px-2.5 py-1 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                        </svg>
                        Attach document name
                        <input
                          type="file"
                          className="sr-only"
                          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              onUpdateDocument(stage.id, item.id, file.name);
                              // Note: file content not stored — only name tracked
                              e.target.value = "";
                            }
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Builder recommendation after planning-complete */}
          {stage.id === "planning-complete" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-3 mt-2">
              <p className="text-xs font-semibold text-blue-800 mb-1">Planning permission granted — now find your builder</p>
              <p className="text-xs text-blue-700 leading-relaxed mb-2">
                The next step is tendering your build. Get at least three quotes from builders experienced in your project type.
              </p>
              <a
                href={`/find-a-professional?tab=builders${county ? `&county=${encodeURIComponent(county)}` : ""}`}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900 underline underline-offset-2"
              >
                Find builders{county ? ` in Co. ${county}` : ""} →
              </a>
            </div>
          )}

          {/* Grants reminders for specific stages */}
          {stage.id === "pre-commencement" && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3.5 py-3 mt-2">
              <p className="text-xs font-semibold text-green-800 mb-1">SEAI grant opportunity — apply now, before work starts</p>
              <p className="text-xs text-green-700 leading-relaxed mb-2">
                If you plan to install solar PV, a heat pump, or insulation, you must apply for SEAI grants <strong>before any works begin</strong>. Starting work first disqualifies your application.
              </p>
              <a href="/grants" className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 underline underline-offset-2">
                Check which grants apply to your self-build →
              </a>
            </div>
          )}
          {stage.id === "completion" && (
            <div className="rounded-xl border border-green-200 bg-green-50 px-3.5 py-3 mt-2">
              <p className="text-xs font-semibold text-green-800 mb-1">SEAI grants at completion</p>
              <p className="text-xs text-green-700 leading-relaxed mb-2">
                Your BER certificate (€200 grant) and Solar PV installation (up to €1,800) can be claimed at or after completion. Verify current amounts at seai.ie before applying.
              </p>
              <a
                href="https://www.seai.ie/grants/home-energy-grants/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-900 underline underline-offset-2"
              >
                Apply at seai.ie →
              </a>
            </div>
          )}

          {/* Stage status controls */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Mark stage as:</p>
            <div className="flex flex-wrap gap-2">
              {(["not-started", "in-progress", "complete"] as StageStatus[]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSetStatus(stage.id, s)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors ${
                    stageState.status === s
                      ? s === "complete"
                        ? "bg-green-600 text-white border-green-600"
                        : s === "in-progress"
                        ? "bg-amber-500 text-white border-amber-500"
                        : "bg-gray-200 text-gray-700 border-gray-200"
                      : "border-gray-200 text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {s === "not-started" ? "Not started" : s === "in-progress" ? "In progress" : "Complete"}
                </button>
              ))}
              {allChecked && stageState.status !== "complete" && (
                <button
                  type="button"
                  onClick={() => onSetStatus(stage.id, "complete")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-green-50 border border-green-300 text-green-700 font-semibold hover:bg-green-100 transition-colors"
                >
                  All tasks done — mark complete ✓
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SelfBuildPage() {
  const { isPaid, loading: authLoading } = useAuthStatus();
  const [data, setData] = useState<SelfBuildData | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<"tracker" | "drawdown" | "portals">("tracker");

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadData();
    setData(saved);
    setLoaded(true);
  }, []);

  // Persist to localStorage whenever data changes
  useEffect(() => {
    if (loaded && data) saveData(data);
  }, [data, loaded]);

  const handleSetup = useCallback((project: SelfBuildProject) => {
    const initial: SelfBuildData = {
      project,
      stages: buildInitialStages(),
      notification: null,
    };
    setData(initial);
  }, []);

  const handleReset = useCallback(() => {
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
    setData(null);
  }, []);

  const handleToggleItem = useCallback((stageId: string, itemId: string) => {
    setData(prev => {
      if (!prev) return prev;
      const stageState = prev.stages[stageId];
      const wasChecked = stageState.checkedItems[itemId] ?? false;
      return {
        ...prev,
        stages: {
          ...prev.stages,
          [stageId]: {
            ...stageState,
            checkedItems: { ...stageState.checkedItems, [itemId]: !wasChecked },
          },
        },
      };
    });
  }, []);

  const handleUpdateDocument = useCallback((stageId: string, itemId: string, name: string) => {
    setData(prev => {
      if (!prev) return prev;
      const stageState = prev.stages[stageId];
      const newDocNames = { ...stageState.documentNames };
      if (name) {
        newDocNames[itemId] = name;
      } else {
        delete newDocNames[itemId];
      }
      return {
        ...prev,
        stages: {
          ...prev.stages,
          [stageId]: { ...stageState, documentNames: newDocNames },
        },
      };
    });
  }, []);

  const handleSetStatus = useCallback((stageId: string, status: StageStatus) => {
    setData(prev => {
      if (!prev) return prev;
      const stageIndex = STAGES.findIndex(s => s.id === stageId);
      let notification: string | null = null;

      if (status === "complete") {
        const nextStage = STAGES[stageIndex + 1];
        if (nextStage) {
          notification = `${STAGES[stageIndex].label} complete! Next up: ${nextStage.label}`;
        } else {
          notification = "Congratulations — your self-build is complete!";
        }
      }

      return {
        ...prev,
        notification,
        stages: {
          ...prev.stages,
          [stageId]: { ...prev.stages[stageId], status },
        },
      };
    });
  }, []);

  // ── Render: loading
  if (authLoading || !loaded) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
          <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading your tracker…</p>
        </div>
      </AppShell>
    );
  }

  // ── Render: no paid access
  if (!isPaid) {
    return (
      <AppShell>
        <UpgradePrompt
          feature="Self-Build Tracker"
          description="Track your entire self-build journey from planning grant to completion — milestones, checklists, bank drawdown documents, and portal links in one place."
        />
      </AppShell>
    );
  }

  // ── Render: setup form
  if (!data) {
    return (
      <AppShell>
        <SetupForm onSetup={handleSetup} />
      </AppShell>
    );
  }

  // ── Render: main tracker
  const { project, stages, notification } = data;
  const isMortgage = project.fundingType === "mortgage";
  const completeCount = Object.values(stages).filter(s => s.status === "complete").length;
  const overallPct = Math.round((completeCount / STAGES.length) * 100);

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Self-Build Tracker</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {project.county} · {project.projectType}
                {project.planningRef && ` · ${project.planningRef}`}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                if (confirm("Reset your tracker? This will delete all progress and cannot be undone.")) {
                  handleReset();
                }
              }}
              className="text-xs text-gray-400 hover:text-red-500 transition-colors border border-gray-200 rounded-lg px-3 py-1.5"
            >
              Reset tracker
            </button>
          </div>

          {/* Overall progress */}
          <div className="mt-5 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Overall progress</p>
              <p className="text-sm font-bold text-green-600">{overallPct}%</p>
            </div>
            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${overallPct}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{completeCount} of {STAGES.length} stages complete</p>
          </div>
        </div>

        {/* Notification banner */}
        {notification && (
          <div className="mb-5 rounded-2xl bg-green-50 border border-green-200 p-4 flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-800">{notification}</p>
              <p className="text-xs text-green-600 mt-0.5">Keep going — you are making great progress.</p>
            </div>
            <button
              type="button"
              onClick={() => setData(prev => prev ? { ...prev, notification: null } : prev)}
              className="text-green-400 hover:text-green-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Visual timeline (horizontal scroll on mobile) */}
        <div className="mb-6 overflow-x-auto pb-2">
          <div className="flex items-center min-w-max gap-0">
            {STAGES.map((stage, i) => {
              const st = stages[stage.id]?.status ?? "not-started";
              return (
                <div key={stage.id} className="flex items-center">
                  <div className="flex flex-col items-center gap-1.5 w-[4.5rem]">
                    <StageIcon index={i} status={st} />
                    <span className={`text-[10px] font-medium text-center leading-tight ${
                      st === "complete" ? "text-green-700" : st === "in-progress" ? "text-amber-700" : "text-gray-400"
                    }`}>
                      {stage.shortLabel}
                    </span>
                  </div>
                  {i < STAGES.length - 1 && (
                    <div className={`h-0.5 w-6 ${
                      stages[stage.id]?.status === "complete" ? "bg-green-500" : "bg-gray-200"
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {([
            { key: "tracker", label: "Stage Checklist" },
            { key: "drawdown", label: isMortgage ? "Bank Drawdowns" : "Stage Guide" },
            { key: "portals", label: "Portals & Links" },
          ] as const).map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 text-xs sm:text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab: Stage Checklist */}
        {activeTab === "tracker" && (
          <div className="space-y-3">
            {STAGES.map((stage, i) => (
              <StageCard
                key={stage.id}
                stage={stage}
                index={i}
                stageState={stages[stage.id] ?? { status: "not-started", checkedItems: {}, documentNames: {} }}
                isMortgage={isMortgage}
                county={project.county}
                onToggleItem={handleToggleItem}
                onUpdateDocument={handleUpdateDocument}
                onSetStatus={handleSetStatus}
              />
            ))}
            <LegalDisclaimer className="mt-4" />
          </div>
        )}

        {/* Tab: Bank Drawdowns */}
        {activeTab === "drawdown" && (
          <div className="space-y-4">
            {!isMortgage && (
              <div className="rounded-xl bg-gray-50 border border-gray-200 p-4 text-sm text-gray-600">
                You selected self-funded. The information below is a general guide to typical build stages and what documents may be needed at each point.
              </div>
            )}
            {BANK_DRAWDOWN_STAGES.map(ds => (
              <div key={ds.stage} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                    {ds.stage}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">{ds.stageLabel}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{ds.description}</p>
                  </div>
                </div>
                <ul className="space-y-1.5 ml-10">
                  {ds.documents.map((doc, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <svg className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-xs text-amber-800 leading-relaxed">
              <strong>Important:</strong> Drawdown document requirements vary by lender. Always confirm the exact list with your bank or mortgage broker before each stage. Failing to provide required documents delays drawdown and can affect your build schedule.
            </div>
            <LegalDisclaimer className="mt-2" />
          </div>
        )}

        {/* Tab: Portals & Links */}
        {activeTab === "portals" && (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              Key portals and services you will need during your self-build.
            </p>
            {PORTAL_LINKS.map(portal => (
              <a
                key={portal.label}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-4 bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:border-green-300 hover:shadow-md transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 text-green-600 group-hover:bg-green-100 transition-colors">
                  {portal.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-gray-900">{portal.label}</h3>
                    <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{portal.description}</p>
                </div>
              </a>
            ))}
            <LegalDisclaimer className="mt-2" />
          </div>
        )}

      </div>
    </AppShell>
  );
}
