"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { CountyIntelPanel } from "@/app/components/CountyIntelPanel";
import { LegalDisclaimer } from "@/app/components/LegalDisclaimer";
import { GrantsDashboardWidget } from "@/app/components/GrantsAlert";
import { UpgradePrompt } from "@/app/components/UpgradePrompt";
import { calculatePlanningFee, DEV_TYPES, euro, type DevTypeKey, type FeeResult } from "@/lib/planningFee";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import { isDemoMode as checkDemoMode } from "@/lib/demo-mode";
import { DashboardShell } from "@/app/components/DashboardShell";
import {
  DEMO_APPLICATIONS,
  DEMO_ACTIVITY_LOGS,
  DEMO_PRACTICE_NAME,
} from "@/lib/demo-data";

const IS_DEMO = checkDemoMode();

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicationStatus =
  | "received"
  | "validated"
  | "under_assessment"
  | "further_info"
  | "fi_response"
  | "decision_made"
  | "appeal"
  // Legacy values kept for backward-compat with existing DB rows
  | "validation"
  | "on_display"
  | "decision_pending"
  | "granted"
  | "refused";

type FilterKey = "all" | "on_track" | "needs_attention" | "decisions";

interface PlanningApplication {
  id: string;
  referenceNumber: string;
  clientName: string;
  clientEmail?: string;
  propertyAddress: string;
  projectDescription?: string; // not stored in DB
  status: ApplicationStatus;
  submissionDate: string;       // YYYY-MM-DD
  statutoryDeadline: string;    // YYYY-MM-DD
  hasRFI?: boolean;             // not stored in DB
  rfiIssuedDate?: string;
  decisionDate?: string;
  portalToken?: string;         // generated from reference when not in DB
  council?: string;
  notes?: string;               // loaded from applications.notes
  updatedAt?: string;
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; badge: string; group: "on_track" | "needs_attention" | "decision" }
> = {
  // Current canonical stages
  received:         { label: "Received",                  badge: "bg-gray-100 text-gray-600 border-gray-200",       group: "on_track" },
  validated:        { label: "Validated",                  badge: "bg-gray-100 text-gray-600 border-gray-200",       group: "on_track" },
  under_assessment: { label: "Under Assessment",           badge: "bg-indigo-100 text-indigo-700 border-indigo-200", group: "on_track" },
  further_info:     { label: "Further Info Requested",     badge: "bg-red-100 text-red-700 border-red-200",          group: "needs_attention" },
  fi_response:      { label: "FI Response Submitted",      badge: "bg-blue-100 text-blue-700 border-blue-200",       group: "on_track" },
  decision_made:    { label: "Decision Made",              badge: "bg-green-100 text-green-700 border-green-200",    group: "decision" },
  appeal:           { label: "Appealed",                   badge: "bg-orange-100 text-orange-700 border-orange-200", group: "needs_attention" },
  // Legacy — kept for backward-compat with existing DB rows
  validation:       { label: "In Validation",              badge: "bg-gray-100 text-gray-600 border-gray-200",       group: "on_track" },
  on_display:       { label: "On Public Display",          badge: "bg-blue-100 text-blue-700 border-blue-200",       group: "on_track" },
  decision_pending: { label: "Decision Pending",           badge: "bg-amber-100 text-amber-700 border-amber-200",    group: "on_track" },
  granted:          { label: "Granted",                    badge: "bg-green-100 text-green-700 border-green-200",    group: "decision" },
  refused:          { label: "Refused",                    badge: "bg-red-100 text-red-700 border-red-200",          group: "decision" },
};

// Dropdown options shown to the architect (canonical 7-stage flow)
const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "received",         label: "Received" },
  { value: "validated",        label: "Validated" },
  { value: "under_assessment", label: "Under Assessment" },
  { value: "further_info",     label: "Further Information Requested" },
  { value: "fi_response",      label: "FI Response Submitted" },
  { value: "decision_made",    label: "Decision Made" },
  { value: "appeal",           label: "Appealed" },
];

// ─── Planning authorities ─────────────────────────────────────────────────────

const COUNCILS = [
  "Carlow County Council",
  "Cavan County Council",
  "Clare County Council",
  "Cork City Council",
  "Cork County Council",
  "Donegal County Council",
  "Dublin City Council",
  "Dún Laoghaire-Rathdown County Council",
  "Fingal County Council",
  "Galway City Council",
  "Galway County Council",
  "Kerry County Council",
  "Kildare County Council",
  "Kilkenny County Council",
  "Laois County Council",
  "Leitrim County Council",
  "Limerick City & County Council",
  "Longford County Council",
  "Louth County Council",
  "Mayo County Council",
  "Meath County Council",
  "Monaghan County Council",
  "Offaly County Council",
  "Roscommon County Council",
  "Sligo County Council",
  "South Dublin County Council",
  "Tipperary County Council",
  "Waterford City & County Council",
  "Westmeath County Council",
  "Wexford County Council",
  "Wicklow County Council",
] as const;

// ─── Activity log ──────────────────────────────────────────────────────────────

interface ActivityLogEntry {
  id: string;
  timestamp: string; // ISO 8601
  type: "status_change" | "note_saved" | "email_sent";
  description: string;
}


// ─── Planning tools — fee types/calculator imported from @/lib/planningFee ───

// Approved / commonly accepted newspapers per local authority area
const NEWSPAPERS: Record<string, string[]> = {
  "Carlow County Council":                  ["Carlow Nationalist", "Nationalist & Leinster Times", "Irish Times", "Irish Independent"],
  "Cavan County Council":                   ["Anglo-Celt", "Irish Times", "Irish Independent"],
  "Clare County Council":                   ["Clare Champion", "Clare People", "Irish Times", "Irish Independent"],
  "Cork City Council":                      ["Irish Examiner", "Echo", "Irish Times", "Irish Independent"],
  "Cork County Council":                    ["Irish Examiner", "Corkman", "Echo", "Irish Times", "Irish Independent"],
  "Donegal County Council":                 ["Donegal Democrat", "Donegal News", "Tirconaill Tribune", "Irish Times", "Irish Independent"],
  "Dublin City Council":                    ["Irish Times", "Irish Independent", "Dublin Inquirer"],
  "Dún Laoghaire-Rathdown County Council":  ["Irish Times", "Irish Independent", "Southside People"],
  "Fingal County Council":                  ["Irish Times", "Irish Independent", "Fingal Independent"],
  "Galway City Council":                    ["Connacht Tribune", "Galway Advertiser", "Irish Times", "Irish Independent"],
  "Galway County Council":                  ["Connacht Tribune", "Connacht Sentinel", "Galway Advertiser", "Irish Times", "Irish Independent"],
  "Kerry County Council":                   ["Kerryman", "Kerry's Eye", "Irish Times", "Irish Independent"],
  "Kildare County Council":                 ["Leinster Leader", "Kildare Nationalist", "Irish Times", "Irish Independent"],
  "Kilkenny County Council":                ["Kilkenny People", "Kilkenny Reporter", "Irish Times", "Irish Independent"],
  "Laois County Council":                   ["Leinster Express", "Laois Nationalist", "Irish Times", "Irish Independent"],
  "Leitrim County Council":                 ["Leitrim Observer", "Leitrim People", "Irish Times", "Irish Independent"],
  "Limerick City & County Council":         ["Limerick Leader", "Limerick Post", "Irish Times", "Irish Independent"],
  "Longford County Council":                ["Longford Leader", "Longford News", "Irish Times", "Irish Independent"],
  "Louth County Council":                   ["Dundalk Democrat", "Drogheda Independent", "Argus", "Irish Times", "Irish Independent"],
  "Mayo County Council":                    ["Mayo News", "Western People", "Connaught Telegraph", "Irish Times", "Irish Independent"],
  "Meath County Council":                   ["Meath Chronicle", "Irish Times", "Irish Independent"],
  "Monaghan County Council":                ["Northern Standard", "Monaghan Post", "Irish Times", "Irish Independent"],
  "Offaly County Council":                  ["Offaly Express", "Offaly Independent", "Irish Times", "Irish Independent"],
  "Roscommon County Council":               ["Roscommon Herald", "Roscommon People", "Irish Times", "Irish Independent"],
  "Sligo County Council":                   ["Sligo Champion", "Sligo Weekender", "Irish Times", "Irish Independent"],
  "South Dublin County Council":            ["Irish Times", "Irish Independent", "Echo"],
  "Tipperary County Council":               ["Nenagh Guardian", "Tipperary Star", "Nationalist and Munster Advertiser", "Irish Times", "Irish Independent"],
  "Waterford City & County Council":        ["Waterford News & Star", "Munster Express", "Irish Times", "Irish Independent"],
  "Westmeath County Council":               ["Westmeath Examiner", "Westmeath Independent", "Irish Times", "Irish Independent"],
  "Wexford County Council":                 ["Wexford People", "New Ross Standard", "Irish Times", "Irish Independent"],
  "Wicklow County Council":                 ["Wicklow People", "Bray People", "Irish Times", "Irish Independent"],
};

function generateNotices(
  applicant: string,
  council: string,
  address: string,
  desc: string,
): { siteNotice: string; newspaperNotice: string } {
  const intent = `intends to apply to ${council} for planning permission`;
  const devText = desc.trim() ? desc.trim() : "the proposed development";
  const inspection = `The planning application may be inspected or purchased at a fee not exceeding the reasonable cost of making a copy at the offices of ${council} during its public office hours.`;
  const submission = `A submission or observation in relation to the application may be made in writing to the planning authority on payment of the prescribed fee (€20.00) within the period of 5 weeks beginning on the date of receipt by the planning authority of the application.`;

  const siteNotice =
    `SITE NOTICE\n\nPLANNING APPLICATION\n\n` +
    `${applicant} ${intent} for ${devText} at ${address}.\n\n` +
    `${inspection}\n\n${submission}`;

  const newspaperNotice =
    `${applicant} ${intent} for ${devText} at ${address}. ` +
    `${inspection} ${submission}`;

  return { siteNotice, newspaperNotice };
}


// ─── Date helpers ──────────────────────────────────────────────────────────────

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / 86_400_000);
}

function daysSince(dateStr: string) {
  return daysBetween(new Date(dateStr), new Date());
}

function daysUntil(dateStr: string) {
  return daysBetween(new Date(), new Date(dateStr));
}

function timeAgo(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function deadlinePill(app: PlanningApplication): { text: string; cls: string } {
  if (STATUS_CONFIG[app.status].group === "decision" && app.decisionDate) {
    const d = daysSince(app.decisionDate);
    return { text: `${d}d ago`, cls: "bg-green-50 text-green-700" };
  }
  const d = daysUntil(app.statutoryDeadline);
  if (d < 0)  return { text: "Passed",     cls: "bg-gray-100 text-gray-500" };
  if (d === 0) return { text: "Today",      cls: "bg-red-50 text-red-700 font-bold" };
  if (d <= 5)  return { text: `${d}d left`, cls: "bg-red-50 text-red-700 font-semibold" };
  if (d <= 10) return { text: `${d}d left`, cls: "bg-amber-50 text-amber-700 font-semibold" };
  return       { text: `${d}d left`,        cls: "bg-gray-50 text-gray-600" };
}

function isNeedsAttention(app: PlanningApplication): boolean {
  const g = STATUS_CONFIG[app.status].group;
  if (g === "needs_attention") return true;
  if (g === "decision") return false;
  return daysUntil(app.statutoryDeadline) <= 5;
}

// ─── SVG icons ─────────────────────────────────────────────────────────────────

function IconPlus({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}

function IconX({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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

function IconLink({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
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

function IconPencil({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
    </svg>
  );
}

function IconChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function IconClock({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function IconEmail({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  );
}

function Spinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className ?? "w-4 h-4"}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// ─── Shared form styles ────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // ── Core state ──
  const [applications, setApplications] = useState<PlanningApplication[]>(
    IS_DEMO ? (DEMO_APPLICATIONS as unknown as PlanningApplication[]) : []
  );
  const [filter, setFilter] = useState<FilterKey>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // ── Auth state ──
  const { isArchitect, loading: authLoading } = useAuthStatus();
  // In demo mode, useAuthStatus already returns isArchitect: true — isDemoMode drives
  // in-memory mutations and UI overrides (header label, skipping API calls).
  const isDemoMode = IS_DEMO;

  // ── Profile state ──
  const [practiceName, setPracticeName] = useState(IS_DEMO ? DEMO_PRACTICE_NAME : "");
  const [practiceId,   setPracticeId]   = useState<string | null>(null);

  // ── Notes state — keyed by referenceNumber ──
  const [notesOpen,   setNotesOpen]   = useState<Record<string, boolean>>({});
  const [notesText,   setNotesText]   = useState<Record<string, string>>({});
  const [notesStatus, setNotesStatus] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

  // ── Status update saving state — keyed by application id ──
  const [statusSaving, setStatusSaving] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

  // ── Send client update state — keyed by referenceNumber ──
  const [sendOpen,   setSendOpen]   = useState<Record<string, boolean>>({});
  const [sendEmail,  setSendEmail]  = useState<Record<string, string>>({});
  const [sendStatus, setSendStatus] = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});
  const [sendSentTo, setSentTo]     = useState<Record<string, string>>({});

  // ── Add-application form state ──
  const [newRef,     setNewRef]     = useState("");
  const [newClient,  setNewClient]  = useState("");
  const [newEmail,   setNewEmail]   = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newDesc,    setNewDesc]    = useState("");
  const [newSub,     setNewSub]     = useState("");
  const [newDead,    setNewDead]    = useState("");
  const [newStatus,  setNewStatus]  = useState<ApplicationStatus>("received");
  const [newCouncil, setNewCouncil] = useState("");

  // ── Activity log state ──
  const [activityLogs, setActivityLogs] = useState<Record<string, ActivityLogEntry[]>>(
    IS_DEMO ? (DEMO_ACTIVITY_LOGS as unknown as Record<string, ActivityLogEntry[]>) : {}
  );
  const [logOpen, setLogOpen] = useState<Record<string, boolean>>({});

  // ── Planning Fee Calculator state ──
  const [showFeeModal, setShowFeeModal] = useState(false);
  const [feeCouncil,   setFeeCouncil]   = useState("");
  const [feeDevType,   setFeeDevType]   = useState<DevTypeKey | "">("");
  const [feeArea,      setFeeArea]      = useState("");
  const [feeResult,    setFeeResult]    = useState<FeeResult | null>(null);

  // ── Newspaper Notice Generator state ──
  const [showNoticeModal,  setShowNoticeModal]  = useState(false);
  const [noticeCouncil,    setNoticeCouncil]    = useState("");
  const [noticeDevType,    setNoticeDevType]    = useState<DevTypeKey | "">("");
  const [noticeApplicant,  setNoticeApplicant]  = useState("");
  const [noticeAddress,    setNoticeAddress]    = useState("");
  const [noticeDesc,       setNoticeDesc]       = useState("");
  const [noticeCopied,     setNoticeCopied]     = useState<"site" | "newspaper" | null>(null);

  // ── Welcome empty state flag (real architect, no applications yet) ──
  const showWelcomeState = !isInitialLoad && !isDemoMode && applications.length === 0;

  // ── Derived stats ──
  const total          = applications.length;
  const onTrackCount   = applications.filter(a => STATUS_CONFIG[a.status].group === "on_track" && !isNeedsAttention(a)).length;
  const attentionCount = applications.filter(isNeedsAttention).length;
  const decisionCount  = applications.filter(a => STATUS_CONFIG[a.status].group === "decision").length;

  // Applications with statutory deadline within 7 days (excludes decided applications)
  const urgentApps = applications
    .filter(a => STATUS_CONFIG[a.status].group !== "decision")
    .filter(a => daysUntil(a.statutoryDeadline) <= 7)
    .sort((a, b) => daysUntil(a.statutoryDeadline) - daysUntil(b.statutoryDeadline));

  // ── Filtered list ──
  const filtered = applications.filter(a => {
    if (filter === "all")              return true;
    if (filter === "on_track")         return STATUS_CONFIG[a.status].group === "on_track" && !isNeedsAttention(a);
    if (filter === "needs_attention")  return isNeedsAttention(a);
    if (filter === "decisions")        return STATUS_CONFIG[a.status].group === "decision";
    return true;
  });

  // ── Activity log helpers ──
  function addLogEntry(appId: string, type: ActivityLogEntry["type"], description: string) {
    const entry: ActivityLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      type,
      description,
    };
    setActivityLogs(prev => ({ ...prev, [appId]: [entry, ...(prev[appId] ?? [])] }));
  }

  function toggleLog(appId: string) {
    setLogOpen(prev => ({ ...prev, [appId]: !prev[appId] }));
  }

  function formatLogTimestamp(iso: string): string {
    const d = new Date(iso);
    return (
      d.toLocaleDateString("en-IE", { day: "2-digit", month: "short", year: "numeric" }) +
      " · " +
      d.toLocaleTimeString("en-IE", { hour: "2-digit", minute: "2-digit" })
    );
  }

  // ── Copy portal link ──
  const copyPortalLink = useCallback(async (app: PlanningApplication) => {
    const token = app.portalToken ?? app.referenceNumber.toLowerCase().replace(/\//g, "-");
    const url = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://granted.ie"}/portal/${token}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedId(app.id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  // ── Add application ──
  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    // Capture before state is cleared
    const ref = newRef, client = newClient, email = newEmail;
    const address = newAddress, desc = newDesc || "Planning application";
    const sub = newSub, dead = newDead, status = newStatus, council = newCouncil;
    const tempId = String(Date.now());

    setApplications(prev => [{
      id:                 tempId,
      referenceNumber:    ref,
      clientName:         client,
      clientEmail:        email || undefined,
      propertyAddress:    address,
      projectDescription: desc,
      status,
      submissionDate:     sub,
      statutoryDeadline:  dead,
      hasRFI:             false,
      portalToken:        `pa_live_${tempId}`,
      council:            council || undefined,
    }, ...prev]);

    setShowModal(false);
    setNewRef(""); setNewClient(""); setNewEmail(""); setNewAddress(""); setNewDesc("");
    setNewSub(""); setNewDead(""); setNewStatus("received"); setNewCouncil("");

    // Persist to Supabase (fire-and-forget — UI already updated)
    fetch("/api/planning-applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        referenceNumber: ref,
        clientName:      client,
        address:         address,
        status,
        submissionDate:  sub,
        statutoryDeadline: dead,
        council:         council || undefined,
        practiceId:      practiceId,
      }),
    }).catch(() => {});
  }

  // ── Load profile and applications on mount ──
  useEffect(() => {
    if (IS_DEMO) { setIsInitialLoad(false); return; }

    let cancelled = false;

    async function load() {
      try {
        const [profileRes, appsRes] = await Promise.all([
          fetch("/api/architect-profile"),
          fetch("/api/planning-applications"),
        ]);
        const [profileData, appsData] = await Promise.all([
          profileRes.json(),
          appsRes.json(),
        ]);
        if (cancelled) return;

        const profile = profileData.profile;

        if (profile) {
          setPracticeName(profile.practiceName ?? "");
          setPracticeId(profile.id ?? null);
        }

        const apps = Array.isArray(appsData.applications) ? appsData.applications : [];

        if (apps.length > 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          setApplications(apps as any);
          const notesMap: Record<string, string> = {};
          apps.forEach((app: { referenceNumber: string; notes?: string }) => {
            if (app.notes) notesMap[app.referenceNumber] = app.notes;
          });
          setNotesText(notesMap);
        }
        // No apps yet — empty array stays in state; welcome empty state is shown
      } catch {
        // Supabase not configured — applications remain empty for new users
      } finally {
        if (!cancelled) setIsInitialLoad(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  // ── Toggle notes panel open/closed ──
  function toggleNotes(ref: string) {
    setNotesOpen(prev => ({ ...prev, [ref]: !prev[ref] }));
  }

  // ── Save notes to Supabase ──
  async function saveNotes(ref: string) {
    const app = applications.find(a => a.referenceNumber === ref);
    if (!app) return;
    setNotesStatus(prev => ({ ...prev, [ref]: "saving" }));
    if (isDemoMode) {
      setTimeout(() => {
        addLogEntry(app.id, "note_saved", "Internal note saved");
        setNotesStatus(prev => ({ ...prev, [ref]: "saved" }));
        setTimeout(() => setNotesStatus(prev => ({ ...prev, [ref]: "idle" })), 2000);
      }, 400);
      return;
    }
    try {
      const res = await fetch(`/api/planning-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notesText[ref] ?? "" }),
      });
      if (!res.ok) throw new Error("save failed");
      addLogEntry(app.id, "note_saved", "Internal note saved");
      setNotesStatus(prev => ({ ...prev, [ref]: "saved" }));
      setTimeout(() => setNotesStatus(prev => ({ ...prev, [ref]: "idle" })), 2000);
    } catch {
      setNotesStatus(prev => ({ ...prev, [ref]: "error" }));
    }
  }

  // ── Update application status ──
  async function updateStatus(app: PlanningApplication, newStatus: ApplicationStatus) {
    const now = new Date().toISOString();
    // Optimistic update
    setApplications(prev =>
      prev.map(a => a.id === app.id ? { ...a, status: newStatus, updatedAt: now } : a)
    );
    setStatusSaving(prev => ({ ...prev, [app.id]: "saving" }));
    if (isDemoMode) {
      setTimeout(() => {
        addLogEntry(app.id, "status_change", `Status changed to ${STATUS_CONFIG[newStatus].label}`);
        setStatusSaving(prev => ({ ...prev, [app.id]: "saved" }));
        setTimeout(() => setStatusSaving(prev => ({ ...prev, [app.id]: "idle" })), 2000);
      }, 300);
      return;
    }
    try {
      const res = await fetch(`/api/planning-applications/${app.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("update failed");
      const data = await res.json();
      // Sync with server response (authoritative updatedAt)
      setApplications(prev =>
        prev.map(a => a.id === app.id ? { ...a, ...data.application } : a)
      );
      addLogEntry(app.id, "status_change", `Status changed to ${STATUS_CONFIG[newStatus].label}`);
      setStatusSaving(prev => ({ ...prev, [app.id]: "saved" }));
      setTimeout(() => setStatusSaving(prev => ({ ...prev, [app.id]: "idle" })), 2000);
    } catch {
      // Revert
      setApplications(prev =>
        prev.map(a => a.id === app.id ? { ...a, status: app.status, updatedAt: app.updatedAt } : a)
      );
      setStatusSaving(prev => ({ ...prev, [app.id]: "error" }));
      setTimeout(() => setStatusSaving(prev => ({ ...prev, [app.id]: "idle" })), 3000);
    }
  }

  // ── Toggle send panel open/closed ──
  function toggleSend(ref: string, defaultEmail?: string) {
    const opening = !sendOpen[ref];
    setSendOpen(prev => ({ ...prev, [ref]: opening }));
    if (opening && defaultEmail && !sendEmail[ref]) {
      setSendEmail(prev => ({ ...prev, [ref]: defaultEmail }));
    }
  }

  // ── Send client update via API ──
  async function sendClientUpdate(app: PlanningApplication) {
    const ref = app.referenceNumber;
    const email = sendEmail[ref]?.trim();
    if (!email) return;
    setSendStatus(prev => ({ ...prev, [ref]: "sending" }));
    if (isDemoMode) {
      setTimeout(() => {
        addLogEntry(app.id, "email_sent", `Client update sent to ${email}`);
        setSendStatus(prev => ({ ...prev, [ref]: "sent" }));
        setSentTo(prev => ({ ...prev, [ref]: email }));
        setTimeout(() => {
          setSendStatus(prev => ({ ...prev, [ref]: "idle" }));
          setSendOpen(prev => ({ ...prev, [ref]: false }));
        }, 3000);
      }, 800);
      return;
    }
    try {
      const res = await fetch("/api/send-client-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber:  app.referenceNumber,
          clientName:       app.clientName,
          clientEmail:      email,
          propertyAddress:  app.propertyAddress,
          projectDescription: app.projectDescription,
          status:           app.status,
          submissionDate:   app.submissionDate,
          statutoryDeadline: app.statutoryDeadline,
          hasRFI:           app.hasRFI,
          rfiIssuedDate:    app.rfiIssuedDate,
          decisionDate:     app.decisionDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "send failed");
      addLogEntry(app.id, "email_sent", `Client update sent to ${email}`);
      setSendStatus(prev => ({ ...prev, [ref]: "sent" }));
      setSentTo(prev => ({ ...prev, [ref]: email }));
      setTimeout(() => {
        setSendStatus(prev => ({ ...prev, [ref]: "idle" }));
        setSendOpen(prev => ({ ...prev, [ref]: false }));
      }, 3000);
    } catch {
      setSendStatus(prev => ({ ...prev, [ref]: "error" }));
    }
  }

  const FILTERS: { key: FilterKey; label: string; count: number }[] = [
    { key: "all",              label: "All",              count: total },
    { key: "on_track",         label: "On Track",         count: onTrackCount },
    { key: "needs_attention",  label: "Needs Attention",  count: attentionCount },
    { key: "decisions",        label: "Decisions",        count: decisionCount },
  ];

  // ── Architect gate ──
  if (!authLoading && !isArchitect) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-10">
        <UpgradePrompt
          feature="Architect Dashboard"
          description="The full pipeline management dashboard is available on the Architect subscription — manage applications, client updates, deadlines, and notice generation in one place."
          tier="architect"
        />
      </div>
    );
  }

  return (
    <DashboardShell
      applicationCount={applications.length}
      urgentCount={urgentApps.length + applications.filter(a => a.hasRFI === true).length}
      practiceName={practiceName}
      isDemoMode={isDemoMode}
      onAddApplication={() => setShowModal(true)}
      onOpenFeeModal={() => { setFeeResult(null); setFeeCouncil(""); setFeeDevType(""); setFeeArea(""); setShowFeeModal(true); }}
      onOpenNoticeModal={() => { setNoticeCouncil(""); setNoticeDevType(""); setNoticeApplicant(""); setNoticeAddress(""); setNoticeDesc(""); setNoticeCopied(null); setShowNoticeModal(true); }}
      breadcrumb={[{ label: "Active Applications" }]}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">

        {/* ── Loading skeleton ───────────────────────────────────────── */}
        {isInitialLoad && (
          <div className="animate-pulse">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7 sm:mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5">
                  <div className="h-4 w-4 bg-gray-200 rounded mb-3" />
                  <div className="h-8 w-12 bg-gray-200 rounded mb-1.5" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-5 sm:mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-8 w-24 bg-gray-200 rounded-lg" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5">
                  <div className="flex justify-between mb-4">
                    <div className="h-3 w-32 bg-gray-200 rounded" />
                    <div className="h-5 w-20 bg-gray-200 rounded-full" />
                  </div>
                  <div className="h-5 w-48 bg-gray-200 rounded mb-2" />
                  <div className="h-3 w-40 bg-gray-200 rounded mb-4" />
                  <div className="flex gap-2">
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Deadline alert banner ──────────────────────────────────── */}
        {!isInitialLoad && urgentApps.length > 0 && (
          <div className="mb-7 sm:mb-8 bg-red-600 rounded-2xl overflow-hidden">
            <div className="px-4 sm:px-5 py-4 flex items-start gap-3">
              {/* Icon */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-white/20 flex items-center justify-center mt-0.5">
                <IconAlert className="w-4 h-4 text-white" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white mb-3">
                  {urgentApps.length === 1
                    ? "1 application has a statutory deadline within 7 days"
                    : `${urgentApps.length} applications have statutory deadlines within 7 days`}
                </p>
                <ul className="space-y-2">
                  {urgentApps.map(app => {
                    const days = daysUntil(app.statutoryDeadline);
                    return (
                      <li
                        key={app.id}
                        className="flex items-center justify-between gap-3 flex-wrap bg-white/10 rounded-xl px-3 py-2"
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-semibold text-white">{app.clientName}</span>
                          <span className="text-red-200 mx-1.5">·</span>
                          <span className="text-xs font-mono text-red-200">{app.referenceNumber}</span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                          days <= 0
                            ? "bg-white text-red-700"
                            : days <= 2
                            ? "bg-red-900 text-red-100"
                            : "bg-red-700 text-white"
                        }`}>
                          {days < 0
                            ? `${Math.abs(days)}d overdue`
                            : days === 0
                            ? "Due today"
                            : `${days}d left`}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Title + Add button (hidden when welcome state is shown) ─── */}
        <div className={`flex items-start justify-between gap-4 mb-7 sm:mb-8${showWelcomeState ? " hidden" : ""}`}>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Active Applications
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {total} application{total !== 1 ? "s" : ""} across all planning authorities
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="shrink-0 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl transition-colors shadow-sm"
          >
            <IconPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Application</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* ── Stats grid ─────────────────────────────────────────────── */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7 sm:mb-8${isInitialLoad || showWelcomeState ? " hidden" : ""}`}>
          {[
            {
              key: "all" as FilterKey,
              label: "Total Applications",
              value: total,
              valueColor: "text-gray-900",
              activeBg: "bg-white ring-2 ring-gray-200 border-gray-300",
              inactiveBg: "bg-white border-gray-200 hover:border-gray-300",
              icon: <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
            },
            {
              key: "on_track" as FilterKey,
              label: "On Track",
              value: onTrackCount,
              valueColor: "text-green-700",
              activeBg: "bg-green-50 ring-2 ring-green-100 border-green-300",
              inactiveBg: "bg-white border-gray-200 hover:border-green-200",
              icon: <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
            },
            {
              key: "needs_attention" as FilterKey,
              label: "Needs Attention",
              value: attentionCount,
              valueColor: "text-amber-700",
              activeBg: "bg-amber-50 ring-2 ring-amber-100 border-amber-300",
              inactiveBg: "bg-white border-gray-200 hover:border-amber-200",
              icon: <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
            },
            {
              key: "decisions" as FilterKey,
              label: "Decisions",
              value: decisionCount,
              valueColor: "text-blue-700",
              activeBg: "bg-blue-50 ring-2 ring-blue-100 border-blue-300",
              inactiveBg: "bg-white border-gray-200 hover:border-blue-200",
              icon: <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>,
            },
          ].map(({ key, label, value, valueColor, activeBg, inactiveBg, icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`text-left rounded-2xl border p-4 sm:p-5 transition-all ${
                filter === key ? activeBg : inactiveBg
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                {icon}
              </div>
              <p className={`text-2xl sm:text-3xl font-bold ${valueColor}`}>{value}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 leading-tight">{label}</p>
            </button>
          ))}
        </div>

        {/* ── Filter tabs ─────────────────────────────────────────────── */}
        <div className={`flex items-center gap-2 mb-5 sm:mb-6 overflow-x-auto pb-0.5 scrollbar-hide${isInitialLoad || showWelcomeState ? " hidden" : ""}`}>
          {FILTERS.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`shrink-0 whitespace-nowrap px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === key
                  ? "bg-gray-900 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-900"
              }`}
            >
              {label}
              <span className={`ml-1.5 text-xs ${filter === key ? "text-gray-300" : "text-gray-400"}`}>
                {count}
              </span>
            </button>
          ))}
        </div>

        {/* ── SEAI Grants widget ─────────────────────────────────────── */}
        {!isInitialLoad && !showWelcomeState && (
          <GrantsDashboardWidget className="mb-6 sm:mb-7" />
        )}

        {/* ── Application cards ───────────────────────────────────────── */}
        <div className={isInitialLoad ? "hidden" : ""}>

        {/* Welcome empty state for new architects */}
        {showWelcomeState && (
          <div className="space-y-6 sm:space-y-8 pb-10">

            {/* Hero welcome banner */}
            <div className="bg-gradient-to-br from-blue-700 to-blue-900 rounded-2xl px-7 sm:px-10 py-8 sm:py-10 text-white shadow-lg">
              <div className="max-w-2xl">
                <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-2">Your planning dashboard</p>
                <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                  {practiceName ? `Welcome to ${practiceName}` : "Welcome to your dashboard"}
                </h1>
                <p className="text-blue-100 text-sm sm:text-base leading-relaxed max-w-xl">
                  Everything you need to manage planning applications in one place — deadlines, client updates, RFI alerts, and county intelligence. Let&apos;s get you set up.
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-6 inline-flex items-center gap-2 bg-white text-blue-800 font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm hover:bg-blue-50 transition-colors"
                >
                  <IconPlus className="w-4 h-4" />
                  Add Your First Application
                </button>
              </div>
            </div>

            {/* Getting started checklist */}
            <div>
              <h2 className="text-base font-semibold text-gray-900 mb-1">Get started in three steps</h2>
              <p className="text-sm text-gray-500 mb-4">Each of these tools is ready to use right now.</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {/* Step 1 */}
                <button
                  onClick={() => setShowModal(true)}
                  className="group text-left bg-white border border-blue-200 hover:border-blue-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      1
                    </div>
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Start here</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-[15px] mb-1.5 leading-snug">Add your first application</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Track reference numbers, deadlines, RFI flags, client contacts, and status — all in one card.</p>
                  <span className="mt-4 inline-flex items-center text-xs font-semibold text-blue-700 group-hover:gap-1.5 transition-all gap-1">
                    Open form
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </span>
                </button>

                {/* Step 2 */}
                <Link
                  href="/check"
                  className="group text-left bg-white border border-gray-200 hover:border-blue-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      2
                    </div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Explore</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-[15px] mb-1.5 leading-snug">Explore county intelligence</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Run planning permission scenarios against local policies to sense-check applications before you submit.</p>
                  <span className="mt-4 inline-flex items-center text-xs font-semibold text-blue-700 group-hover:gap-1.5 transition-all gap-1">
                    Go to county checker
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </span>
                </Link>

                {/* Step 3 */}
                <Link
                  href="/interpreter"
                  className="group text-left bg-white border border-gray-200 hover:border-blue-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-sm shrink-0 group-hover:bg-blue-700 group-hover:text-white transition-colors">
                      3
                    </div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Try it</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-[15px] mb-1.5 leading-snug">Try the document interpreter</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">Upload a planning notice or RFI letter and get a plain-English breakdown of what it means and what you need to do.</p>
                  <span className="mt-4 inline-flex items-center text-xs font-semibold text-blue-700 group-hover:gap-1.5 transition-all gap-1">
                    Open interpreter
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                  </span>
                </Link>
              </div>
            </div>

            {/* Dashboard preview explanation */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7">
              <h3 className="font-semibold text-gray-900 mb-1">What your dashboard will look like</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">
                Once you add applications, each one gets its own card showing real-time status, days until the statutory deadline, RFI flags, and quick actions for client updates and internal notes.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { icon: "📋", label: "Deadline tracking", desc: "Colour-coded urgency with days remaining" },
                  { icon: "⚠️", label: "RFI alerts",        desc: "Flagged automatically when further info is requested" },
                  { icon: "✉️", label: "Client updates",    desc: "One-click AI-generated status emails" },
                ].map(({ icon, label, desc }) => (
                  <div key={label} className="flex items-start gap-3 bg-gray-50 rounded-xl px-4 py-3.5">
                    <span className="text-base shrink-0 mt-0.5">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Applications list (filtered, shown when there are real applications) */}
        {!showWelcomeState && (filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center shadow-sm">
            <p className="text-gray-400 text-sm">No applications in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            {filtered.map(app => {
              const sc    = STATUS_CONFIG[app.status];
              const pill  = deadlinePill(app);
              const since = daysSince(app.submissionDate);
              const attn  = isNeedsAttention(app);
              const decided = sc.group === "decision";
              const copied  = copiedId === app.id;

              return (
                <div
                  key={app.id}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow flex flex-col ${
                    attn && !decided ? "border-amber-200" : "border-gray-200"
                  }`}
                >
                  {/* ── Card header ── */}
                  <div className="px-5 pt-5 pb-4">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      {/* Left: RFI flag + ref */}
                      <div className="flex items-center gap-2 flex-wrap min-w-0">
                        {app.hasRFI === true && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-600 text-white px-2 py-0.5 rounded-full shrink-0">
                            <IconAlert className="w-3 h-3" />
                            RFI
                          </span>
                        )}
                        <span className="text-xs font-mono text-gray-400 truncate">
                          {app.referenceNumber}
                        </span>
                      </div>
                      {/* Right: status badge */}
                      <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${sc.badge}`}>
                        {sc.label}
                      </span>
                    </div>
                  </div>

                  {/* ── Card body ── */}
                  <div className="px-5 pb-4 flex-1">
                    <h3 className="font-semibold text-gray-900 text-[15px] leading-snug">
                      {app.clientName}
                    </h3>
                    <p className="text-sm text-gray-500 mt-0.5">{app.propertyAddress}</p>
                    <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">
                      {app.projectDescription}
                    </p>

                    {/* RFI alert */}
                    {app.hasRFI === true && app.rfiIssuedDate && (
                      <div className="mt-3 flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                        <IconAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-red-700 leading-relaxed">
                          RFI issued {daysSince(app.rfiIssuedDate)} days ago — response required before the statutory deadline.
                        </p>
                      </div>
                    )}

                    {/* Stats row */}
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <div className="bg-gray-50 rounded-xl px-3 py-2.5">
                        <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide mb-0.5">
                          Since submission
                        </p>
                        <p className="text-sm font-semibold text-gray-700">{since} days</p>
                      </div>
                      <div className={`rounded-xl px-3 py-2.5 ${pill.cls}`}>
                        <p className="text-[10px] font-medium uppercase tracking-wide mb-0.5 opacity-70">
                          {decided ? "Decision issued" : "Statutory deadline"}
                        </p>
                        <p className={`text-sm font-semibold`}>{pill.text}</p>
                      </div>
                    </div>

                    {/* ── Status update ── */}
                    <div className="mt-3 flex items-center gap-2.5">
                      <div className="relative flex-1">
                        <select
                          value={app.status}
                          onChange={e => updateStatus(app, e.target.value as ApplicationStatus)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none cursor-pointer transition-colors"
                        >
                          {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                          {/* Render current value as an option if it's a legacy status not in the canonical list */}
                          {!STATUS_OPTIONS.find(o => o.value === app.status) && (
                            <option value={app.status}>{STATUS_CONFIG[app.status]?.label ?? app.status}</option>
                          )}
                        </select>
                        <IconChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                      </div>
                      <span className={`text-xs whitespace-nowrap min-w-[3.5rem] text-right transition-colors ${
                        statusSaving[app.id] === "saving" ? "text-gray-400"  :
                        statusSaving[app.id] === "saved"  ? "text-green-600" :
                        statusSaving[app.id] === "error"  ? "text-red-500"   : "text-transparent"
                      }`}>
                        {statusSaving[app.id] === "saving" ? "Saving…"  :
                         statusSaving[app.id] === "saved"  ? "✓ Saved"  :
                         statusSaving[app.id] === "error"  ? "Failed"   : "·"}
                      </span>
                    </div>
                  </div>

                  {/* ── Notes panel (expands above footer) ── */}
                  {notesOpen[app.referenceNumber] && (
                    <div className="px-5 pb-4">
                      <div className="h-px bg-gray-100 mb-3" />
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Internal notes
                      </label>
                      <textarea
                        value={notesText[app.referenceNumber] ?? ""}
                        onChange={e =>
                          setNotesText(prev => ({ ...prev, [app.referenceNumber]: e.target.value }))
                        }
                        placeholder="Add notes visible only to you — call-backs, site visit dates, client queries…"
                        rows={3}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors leading-relaxed"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-xs min-w-[4rem] transition-colors ${
                          notesStatus[app.referenceNumber] === "saved"  ? "text-green-600" :
                          notesStatus[app.referenceNumber] === "error"  ? "text-red-500"   :
                          notesStatus[app.referenceNumber] === "saving" ? "text-gray-400"  : "text-transparent"
                        }`}>
                          {notesStatus[app.referenceNumber] === "saving" ? "Saving…"       :
                           notesStatus[app.referenceNumber] === "saved"  ? "✓ Saved"       :
                           notesStatus[app.referenceNumber] === "error"  ? "Failed to save" : "·"}
                        </span>
                        <button
                          onClick={() => saveNotes(app.referenceNumber)}
                          disabled={notesStatus[app.referenceNumber] === "saving"}
                          className="text-xs font-semibold bg-gray-900 hover:bg-gray-700 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
                        >
                          Save notes
                        </button>
                      </div>
                    </div>
                  )}

                  {/* ── Send client update panel (expands above footer) ── */}
                  {sendOpen[app.referenceNumber] && (
                    <div className="px-5 pb-4">
                      <div className="h-px bg-gray-100 mb-3" />
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                        Send client update
                      </label>
                      {sendStatus[app.referenceNumber] === "sent" ? (
                        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-3">
                          <IconCheck className="w-4 h-4 text-green-600 shrink-0" />
                          <p className="text-sm font-medium text-green-700">
                            Email sent to {sendSentTo[app.referenceNumber]}
                          </p>
                        </div>
                      ) : (
                        <>
                          <input
                            type="email"
                            value={sendEmail[app.referenceNumber] ?? ""}
                            onChange={e =>
                              setSendEmail(prev => ({ ...prev, [app.referenceNumber]: e.target.value }))
                            }
                            placeholder="client@example.com"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                          />
                          {sendStatus[app.referenceNumber] === "error" && (
                            <p className="mt-1.5 text-xs text-red-600">Failed to send — check your API keys and try again.</p>
                          )}
                          <div className="flex items-center justify-end mt-2">
                            <button
                              onClick={() => sendClientUpdate(app)}
                              disabled={
                                !sendEmail[app.referenceNumber]?.trim() ||
                                sendStatus[app.referenceNumber] === "sending"
                              }
                              className="flex items-center gap-2 text-xs font-semibold bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3.5 py-1.5 rounded-lg transition-colors"
                            >
                              {sendStatus[app.referenceNumber] === "sending" ? (
                                <>
                                  <Spinner className="w-3.5 h-3.5" />
                                  Generating &amp; sending…
                                </>
                              ) : (
                                <>
                                  <IconEmail className="w-3.5 h-3.5" />
                                  Send update
                                </>
                              )}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* ── Activity log panel ── */}
                  {logOpen[app.id] && (
                    <div className="px-5 pb-4">
                      <div className="h-px bg-gray-100 mb-3" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2.5">
                        Activity log
                      </p>
                      {(activityLogs[app.id] ?? []).length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No activity recorded yet.</p>
                      ) : (
                        <ol className="space-y-2">
                          {(activityLogs[app.id] ?? []).map(entry => (
                            <li key={entry.id} className="flex items-start gap-2.5">
                              {/* type dot */}
                              <span className={`mt-[5px] w-1.5 h-1.5 rounded-full shrink-0 ${
                                entry.type === "status_change" ? "bg-indigo-400" :
                                entry.type === "email_sent"    ? "bg-green-400" :
                                                                 "bg-gray-400"
                              }`} />
                              <div className="min-w-0">
                                <p className="text-[11px] text-gray-400 leading-none mb-0.5">
                                  {formatLogTimestamp(entry.timestamp)}
                                </p>
                                <p className="text-xs text-gray-700 leading-snug">
                                  {entry.description}
                                </p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}

                  {/* ── Card footer: notes toggle + portal link + send update ── */}
                  <div className="px-5 pb-5 pt-1">
                    <div className="h-px bg-gray-100 mb-3" />
                    {app.updatedAt && (
                      <div className="flex items-center gap-1.5 mb-3">
                        <IconClock className="w-3 h-3 text-gray-300 shrink-0" />
                        <span className="text-[11px] text-gray-400">Updated {timeAgo(app.updatedAt)}</span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      {/* Notes toggle button */}
                      <button
                        onClick={() => toggleNotes(app.referenceNumber)}
                        title={notesText[app.referenceNumber]?.trim() ? "Edit notes" : "Add notes"}
                        aria-label="Notes"
                        className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all shrink-0 ${
                          notesOpen[app.referenceNumber]
                            ? "bg-gray-900 border-gray-900 text-white"
                            : "bg-white border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <IconPencil className="w-4 h-4" />
                        {notesText[app.referenceNumber]?.trim() && !notesOpen[app.referenceNumber] && (
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />
                        )}
                      </button>
                      {/* Send client update button */}
                      <button
                        onClick={() => toggleSend(app.referenceNumber, app.clientEmail)}
                        aria-label="Send client update"
                        className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all shrink-0 ${
                          sendOpen[app.referenceNumber]
                            ? "bg-green-600 border-green-600 text-white"
                            : "bg-white border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300"
                        }`}
                        title="Send client update email"
                      >
                        <IconEmail className="w-4 h-4" />
                      </button>
                      {/* Activity log button */}
                      <button
                        onClick={() => toggleLog(app.id)}
                        aria-label="Activity log"
                        title="View activity log"
                        className={`relative flex items-center justify-center w-10 h-10 rounded-xl border transition-all shrink-0 ${
                          logOpen[app.id]
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "bg-white border-gray-200 text-gray-400 hover:text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <IconClock className="w-4 h-4" />
                        {(activityLogs[app.id] ?? []).length > 0 && !logOpen[app.id] && (
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400" />
                        )}
                      </button>
                      {/* Portal link button */}
                      <button
                        onClick={() => copyPortalLink(app)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border text-sm font-medium transition-all ${
                          copied
                            ? "bg-green-50 border-green-200 text-green-700"
                            : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 active:bg-gray-100"
                        }`}
                      >
                        {copied ? (
                          <>
                            <IconCheck className="w-4 h-4" />
                            Client portal link copied
                          </>
                        ) : (
                          <>
                            <IconLink className="w-4 h-4" />
                            Generate client portal link
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        </div>
        {/* ── Tools ──────────────────────────────────────────────────── */}
        <section className={`mt-12 sm:mt-14${isInitialLoad ? " hidden" : ""}`}>
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Tools</h2>
            <p className="text-sm text-gray-500 mt-1">Quick-access calculators and generators for your planning work.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">

            {/* Planning Fee Calculator card */}
            <button
              onClick={() => { setFeeResult(null); setFeeCouncil(""); setFeeDevType(""); setFeeArea(""); setShowFeeModal(true); }}
              className="text-left bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-green-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.522 4.5 4.5v15a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 19.5v-15c0-.978-.807-1.8-1.907-1.928A48.507 48.507 0 0012 2.25z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-[15px] mb-1">Planning Fee Calculator</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Calculate the correct planning fee based on Schedule 5 of the Planning &amp; Development Regulations. Select your local authority, development type, and floor area.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-green-600 group-hover:text-green-700">
                Open calculator
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>

            {/* Newspaper Notice Generator card */}
            <button
              onClick={() => { setNoticeCouncil(""); setNoticeDevType(""); setNoticeApplicant(""); setNoticeAddress(""); setNoticeDesc(""); setNoticeCopied(null); setShowNoticeModal(true); }}
              className="text-left bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 hover:border-green-300 hover:shadow-sm transition-all group"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-[15px] mb-1">Newspaper Notice Generator</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Generate correctly worded site notice and newspaper notice text. Includes the list of approved newspapers for each of the 31 local authority areas.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-sm font-medium text-green-600 group-hover:text-green-700">
                Generate notices
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </div>
            </button>

          </div>
        </section>

      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}

      {/* Add Application Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Add Application</h2>
                <p className="text-xs text-gray-400 mt-0.5">Track a new planning application</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            {/* Modal form */}
            <form
              onSubmit={handleAdd}
              className="px-5 sm:px-6 py-5 space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="m-ref">Reference number *</label>
                  <input
                    id="m-ref"
                    type="text"
                    value={newRef}
                    onChange={e => setNewRef(e.target.value)}
                    required
                    placeholder="e.g. DCC/2026/001234"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="m-status">Current status *</label>
                  <select
                    id="m-status"
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as ApplicationStatus)}
                    className={inputCls + " appearance-none cursor-pointer"}
                  >
                    <option value="received">Received</option>
                    <option value="validation">In Validation</option>
                    <option value="on_display">On Public Display</option>
                    <option value="under_assessment">Under Assessment</option>
                    <option value="further_info">Further Info Required</option>
                    <option value="decision_pending">Decision Pending</option>
                    <option value="granted">Granted</option>
                    <option value="refused">Refused</option>
                    <option value="appeal">Under Appeal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls} htmlFor="m-client">Client name *</label>
                <input
                  id="m-client"
                  type="text"
                  value={newClient}
                  onChange={e => setNewClient(e.target.value)}
                  required
                  placeholder="e.g. John & Mary Smith"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="m-email">
                  Client email <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  id="m-email"
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  placeholder="e.g. client@example.com"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="m-address">Property address *</label>
                <input
                  id="m-address"
                  type="text"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  required
                  placeholder="e.g. 12 Oak Avenue, Blackrock, Co. Dublin"
                  className={inputCls}
                />
              </div>

              <div>
                <label className={labelCls} htmlFor="m-council">Planning authority</label>
                <select
                  id="m-council"
                  value={newCouncil}
                  onChange={e => setNewCouncil(e.target.value)}
                  className={inputCls + " appearance-none cursor-pointer"}
                >
                  <option value="">Select authority…</option>
                  {COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {newCouncil && (
                <CountyIntelPanel county={newCouncil} />
              )}

              <div>
                <label className={labelCls} htmlFor="m-desc">Project description</label>
                <input
                  id="m-desc"
                  type="text"
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  placeholder="e.g. Rear extension to existing dwelling"
                  className={inputCls}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls} htmlFor="m-sub">Submission date *</label>
                  <input
                    id="m-sub"
                    type="date"
                    value={newSub}
                    onChange={e => setNewSub(e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls} htmlFor="m-dead">Statutory deadline *</label>
                  <input
                    id="m-dead"
                    type="date"
                    value={newDead}
                    onChange={e => setNewDead(e.target.value)}
                    required
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2 pb-safe pb-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-semibold transition-colors"
                >
                  Add Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Planning Fee Calculator Modal ─────────────────────────────── */}
      {showFeeModal && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={e => { if (e.target === e.currentTarget) setShowFeeModal(false); }}
        >
          <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Planning Fee Calculator</h2>
                <p className="text-xs text-gray-400 mt-0.5">Schedule 5 — Planning &amp; Development Regulations</p>
              </div>
              <button
                onClick={() => setShowFeeModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <IconX className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 sm:px-6 py-5 space-y-4 max-h-[85vh] overflow-y-auto">
              <div>
                <label className={labelCls} htmlFor="fc-council">Planning authority</label>
                <select
                  id="fc-council"
                  value={feeCouncil}
                  onChange={e => setFeeCouncil(e.target.value)}
                  className={inputCls + " appearance-none cursor-pointer"}
                >
                  <option value="">Select local authority…</option>
                  {COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {feeCouncil && (
                <CountyIntelPanel county={feeCouncil} />
              )}

              <div>
                <label className={labelCls} htmlFor="fc-devtype">Development type</label>
                <select
                  id="fc-devtype"
                  value={feeDevType}
                  onChange={e => setFeeDevType(e.target.value as DevTypeKey | "")}
                  className={inputCls + " appearance-none cursor-pointer"}
                >
                  <option value="">Select development type…</option>
                  {DEV_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls} htmlFor="fc-area">Floor area (sq m)</label>
                <input
                  id="fc-area"
                  type="number"
                  min={1}
                  step={0.5}
                  value={feeArea}
                  onChange={e => setFeeArea(e.target.value)}
                  placeholder="e.g. 45"
                  className={inputCls}
                />
              </div>

              <button
                onClick={() => {
                  if (!feeDevType || !feeArea) return;
                  setFeeResult(calculatePlanningFee(feeDevType, parseFloat(feeArea)));
                }}
                disabled={!feeDevType || !feeArea || isNaN(parseFloat(feeArea)) || parseFloat(feeArea) <= 0}
                className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition-colors"
              >
                Calculate fee
              </button>

              {feeResult && (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">Planning fee payable</p>
                  <p className="text-4xl font-bold text-green-700 mb-4">
                    {euro(feeResult.fee)}
                  </p>
                  <div className="space-y-1.5 mb-4">
                    {feeResult.breakdown.map((line, i) => (
                      <p key={i} className="text-sm text-green-800 leading-snug">{line}</p>
                    ))}
                  </div>
                  {feeResult.note && (
                    <div className="bg-white/60 rounded-xl px-3.5 py-2.5 mt-3">
                      <p className="text-xs text-green-700 leading-relaxed">{feeResult.note}</p>
                    </div>
                  )}
                  <p className="mt-3 text-[11px] text-green-600 opacity-70 leading-relaxed">
                    Fees are set by the Planning &amp; Development Regulations 2001, Schedule 5, as amended. Always verify against the current statutory instrument before submission.
                  </p>
                </div>
              )}
              <LegalDisclaimer className="mt-4" />
            </div>
          </div>
        </div>
      )}

      {/* ── Newspaper Notice Generator Modal ──────────────────────────── */}
      {showNoticeModal && (() => {
        const newspapers = noticeCouncil ? (NEWSPAPERS[noticeCouncil] ?? []) : [];
        const notices = (noticeApplicant.trim() && noticeAddress.trim())
          ? generateNotices(noticeApplicant.trim(), noticeCouncil || "[Planning Authority]", noticeAddress.trim(), noticeDesc.trim())
          : null;

        async function copyNotice(text: string, which: "site" | "newspaper") {
          try { await navigator.clipboard.writeText(text); }
          catch {
            const el = document.createElement("textarea");
            el.value = text; document.body.appendChild(el); el.select();
            document.execCommand("copy"); document.body.removeChild(el);
          }
          setNoticeCopied(which);
          setTimeout(() => setNoticeCopied(null), 2000);
        }

        return (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowNoticeModal(false); }}
          >
            <div className="bg-white w-full sm:max-w-2xl rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">

              <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Newspaper Notice Generator</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Planning &amp; Development Regulations — Second Schedule wording</p>
                </div>
                <button
                  onClick={() => setShowNoticeModal(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <IconX className="w-4 h-4" />
                </button>
              </div>

              <div className="px-5 sm:px-6 py-5 space-y-4 max-h-[82vh] overflow-y-auto">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="nn-council">Planning authority</label>
                    <select
                      id="nn-council"
                      value={noticeCouncil}
                      onChange={e => setNoticeCouncil(e.target.value)}
                      className={inputCls + " appearance-none cursor-pointer"}
                    >
                      <option value="">Select local authority…</option>
                      {COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="nn-devtype">Development type</label>
                    <select
                      id="nn-devtype"
                      value={noticeDevType}
                      onChange={e => setNoticeDevType(e.target.value as DevTypeKey | "")}
                      className={inputCls + " appearance-none cursor-pointer"}
                    >
                      <option value="">Select type…</option>
                      {DEV_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                    </select>
                  </div>
                </div>

                {noticeCouncil && (
                  <CountyIntelPanel county={noticeCouncil} />
                )}

                <div>
                  <label className={labelCls} htmlFor="nn-applicant">Applicant name(s)</label>
                  <input
                    id="nn-applicant"
                    type="text"
                    value={noticeApplicant}
                    onChange={e => setNoticeApplicant(e.target.value)}
                    placeholder="e.g. John and Mary Smith"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="nn-address">Site address</label>
                  <input
                    id="nn-address"
                    type="text"
                    value={noticeAddress}
                    onChange={e => setNoticeAddress(e.target.value)}
                    placeholder="e.g. 12 Oak Avenue, Blackrock, Co. Dublin"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="nn-desc">
                    Development description
                    <span className="text-gray-400 font-normal ml-1">(optional — leave blank for generic wording)</span>
                  </label>
                  <input
                    id="nn-desc"
                    type="text"
                    value={noticeDesc}
                    onChange={e => setNoticeDesc(e.target.value)}
                    placeholder="e.g. the construction of a single-storey rear extension to the existing dwelling"
                    className={inputCls}
                  />
                </div>

                {/* Approved newspapers */}
                {newspapers.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Approved newspapers for {noticeCouncil}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {newspapers.map(n => (
                        <span key={n} className="inline-flex items-center text-xs font-medium bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
                          {n}
                        </span>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                      Any newspaper circulating in the area is acceptable. The above are commonly used for this authority.
                    </p>
                  </div>
                )}

                {/* Generated notices */}
                {notices && (
                  <div className="space-y-4">

                    {/* Site notice */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Site Notice</p>
                        <button
                          onClick={() => copyNotice(notices.siteNotice, "site")}
                          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                            noticeCopied === "site"
                              ? "bg-green-100 text-green-700"
                              : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {noticeCopied === "site" ? <><IconCheck className="w-3 h-3" /> Copied</> : "Copy text"}
                        </button>
                      </div>
                      <pre className="px-4 py-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
                        {notices.siteNotice}
                      </pre>
                    </div>

                    {/* Newspaper notice */}
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Newspaper Notice</p>
                        <button
                          onClick={() => copyNotice(notices.newspaperNotice, "newspaper")}
                          className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg transition-colors ${
                            noticeCopied === "newspaper"
                              ? "bg-green-100 text-green-700"
                              : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          {noticeCopied === "newspaper" ? <><IconCheck className="w-3 h-3" /> Copied</> : "Copy text"}
                        </button>
                      </div>
                      <p className="px-4 py-3 text-xs text-gray-700 leading-relaxed">
                        {notices.newspaperNotice}
                      </p>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      Wording follows the Planning &amp; Development Regulations 2001 (Second Schedule). Verify against the current statutory instrument and your planning authority&apos;s requirements before publication.
                    </p>
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })()}

    </DashboardShell>
  );
}
