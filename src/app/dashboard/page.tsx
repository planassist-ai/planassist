"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type ApplicationStatus =
  | "received"
  | "validation"
  | "on_display"
  | "under_assessment"
  | "further_info"
  | "decision_pending"
  | "granted"
  | "refused"
  | "appeal";

type FilterKey = "all" | "on_track" | "needs_attention" | "decisions";

interface PlanningApplication {
  id: string;
  referenceNumber: string;
  clientName: string;
  propertyAddress: string;
  projectDescription: string;
  status: ApplicationStatus;
  submissionDate: string;   // YYYY-MM-DD
  statutoryDeadline: string; // YYYY-MM-DD
  hasRFI: boolean;
  rfiIssuedDate?: string;
  decisionDate?: string;
  portalToken: string;
}

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; badge: string; group: "on_track" | "needs_attention" | "decision" }
> = {
  received:         { label: "Received",               badge: "bg-gray-100 text-gray-600 border-gray-200",    group: "on_track" },
  validation:       { label: "In Validation",           badge: "bg-gray-100 text-gray-600 border-gray-200",    group: "on_track" },
  on_display:       { label: "On Public Display",       badge: "bg-blue-100 text-blue-700 border-blue-200",    group: "on_track" },
  under_assessment: { label: "Under Assessment",        badge: "bg-indigo-100 text-indigo-700 border-indigo-200", group: "on_track" },
  further_info:     { label: "Further Info Required",   badge: "bg-red-100 text-red-700 border-red-200",       group: "needs_attention" },
  decision_pending: { label: "Decision Pending",        badge: "bg-amber-100 text-amber-700 border-amber-200", group: "on_track" },
  granted:          { label: "Granted",                 badge: "bg-green-100 text-green-700 border-green-200", group: "decision" },
  refused:          { label: "Refused",                 badge: "bg-red-100 text-red-700 border-red-200",       group: "decision" },
  appeal:           { label: "Under Appeal",            badge: "bg-orange-100 text-orange-700 border-orange-200", group: "needs_attention" },
};

// ─── Seeded demo data ──────────────────────────────────────────────────────────
// Dates are relative to 2026-03-22 (current demo date) so stats look live.

const SEED_APPLICATIONS: PlanningApplication[] = [
  {
    id: "1",
    referenceNumber: "DCC/2026/000421",
    clientName: "Sarah & James O'Brien",
    propertyAddress: "23 Maple Drive, Ranelagh, Dublin 6",
    projectDescription: "Rear extension and attic conversion to existing dwelling",
    status: "under_assessment",
    submissionDate: "2026-02-05",
    statutoryDeadline: "2026-04-06",
    hasRFI: false,
    portalToken: "pa_live_421obrien",
  },
  {
    id: "2",
    referenceNumber: "DLRCC/2026/000276",
    clientName: "Patrick Connolly",
    propertyAddress: "7 The Oaks, Stillorgan, Co. Dublin",
    projectDescription: "New two-storey detached dwelling with detached garage",
    status: "further_info",
    submissionDate: "2026-01-14",
    statutoryDeadline: "2026-03-30",
    hasRFI: true,
    rfiIssuedDate: "2026-03-12",
    portalToken: "pa_live_276connolly",
  },
  {
    id: "3",
    referenceNumber: "SDCC/2026/000134",
    clientName: "Murphy Family Trust",
    propertyAddress: "14 Ashfield Park, Templeogue, Dublin 12",
    projectDescription: "Single storey side extension to existing semi-detached dwelling",
    status: "decision_pending",
    submissionDate: "2026-01-09",
    statutoryDeadline: "2026-03-24",
    hasRFI: false,
    portalToken: "pa_live_134murphy",
  },
  {
    id: "4",
    referenceNumber: "DCC/2025/002891",
    clientName: "Aoife Brennan",
    propertyAddress: "Apt 4B Kilmainham Court, South Circular Road, Dublin 8",
    projectDescription: "Change of use from retail unit to café/restaurant at ground floor level",
    status: "granted",
    submissionDate: "2025-12-22",
    statutoryDeadline: "2026-02-16",
    hasRFI: false,
    decisionDate: "2026-03-17",
    portalToken: "pa_live_2891brennan",
  },
];

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

// ─── Shared form styles ────────────────────────────────────────────────────────

const inputCls =
  "w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors";
const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [applications, setApplications] = useState<PlanningApplication[]>(SEED_APPLICATIONS);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Notes state — keyed by referenceNumber
  const [notesOpen,   setNotesOpen]   = useState<Record<string, boolean>>({});
  const [notesText,   setNotesText]   = useState<Record<string, string>>({});
  const [notesStatus, setNotesStatus] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

  // Add-application form state
  const [newRef,     setNewRef]     = useState("");
  const [newClient,  setNewClient]  = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newDesc,    setNewDesc]    = useState("");
  const [newSub,     setNewSub]     = useState("");
  const [newDead,    setNewDead]    = useState("");
  const [newStatus,  setNewStatus]  = useState<ApplicationStatus>("received");

  // ── Derived stats ──
  const total         = applications.length;
  const onTrackCount  = applications.filter(a => STATUS_CONFIG[a.status].group === "on_track" && !isNeedsAttention(a)).length;
  const attentionCount = applications.filter(isNeedsAttention).length;
  const decisionCount = applications.filter(a => STATUS_CONFIG[a.status].group === "decision").length;

  // ── Filtered list ──
  const filtered = applications.filter(a => {
    if (filter === "all")              return true;
    if (filter === "on_track")         return STATUS_CONFIG[a.status].group === "on_track" && !isNeedsAttention(a);
    if (filter === "needs_attention")  return isNeedsAttention(a);
    if (filter === "decisions")        return STATUS_CONFIG[a.status].group === "decision";
    return true;
  });

  // ── Copy portal link ──
  const copyPortalLink = useCallback(async (app: PlanningApplication) => {
    const url = `https://planassist.ie/portal/${app.portalToken}`;
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
    setApplications(prev => [{
      id: String(Date.now()),
      referenceNumber: newRef,
      clientName: newClient,
      propertyAddress: newAddress,
      projectDescription: newDesc || "Planning application",
      status: newStatus,
      submissionDate: newSub,
      statutoryDeadline: newDead,
      hasRFI: false,
      portalToken: `pa_live_${Date.now()}`,
    }, ...prev]);
    setShowModal(false);
    setNewRef(""); setNewClient(""); setNewAddress(""); setNewDesc("");
    setNewSub(""); setNewDead(""); setNewStatus("received");
  }

  // ── Load all saved notes on mount ──
  useEffect(() => {
    fetch("/api/application-notes")
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.notes)) {
          setNotesText(
            Object.fromEntries(
              data.notes.map((n: { reference_number: string; notes: string }) => [
                n.reference_number,
                n.notes,
              ])
            )
          );
        }
      })
      .catch(() => {}); // notes are non-critical — fail silently
  }, []);

  // ── Toggle notes panel open/closed ──
  function toggleNotes(ref: string) {
    setNotesOpen(prev => ({ ...prev, [ref]: !prev[ref] }));
  }

  // ── Save notes to Supabase ──
  async function saveNotes(ref: string) {
    setNotesStatus(prev => ({ ...prev, [ref]: "saving" }));
    try {
      const res = await fetch("/api/application-notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referenceNumber: ref, notes: notesText[ref] ?? "" }),
      });
      if (!res.ok) throw new Error("save failed");
      setNotesStatus(prev => ({ ...prev, [ref]: "saved" }));
      setTimeout(() => setNotesStatus(prev => ({ ...prev, [ref]: "idle" })), 2000);
    } catch {
      setNotesStatus(prev => ({ ...prev, [ref]: "error" }));
    }
  }

  const FILTERS: { key: FilterKey; label: string; count: number }[] = [
    { key: "all",              label: "All",              count: total },
    { key: "on_track",         label: "On Track",         count: onTrackCount },
    { key: "needs_attention",  label: "Needs Attention",  count: attentionCount },
    { key: "decisions",        label: "Decisions",        count: decisionCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">

      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link href="/" className="text-xl font-bold text-green-600 tracking-tight shrink-0">
              PlanAssist
            </Link>
            <span className="hidden sm:block w-px h-5 bg-gray-200" />
            <span className="hidden sm:block text-sm text-gray-400">Architect Dashboard</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden sm:inline-flex items-center text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
              Pro · €199/mo
            </span>
            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
              A
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 lg:py-10">

        {/* ── Title + Add button ─────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 mb-7 sm:mb-8">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-7 sm:mb-8">
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
        <div className="flex items-center gap-2 mb-5 sm:mb-6 overflow-x-auto pb-0.5 scrollbar-hide">
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

        {/* ── Application cards ───────────────────────────────────────── */}
        {filtered.length === 0 ? (
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
                        {app.hasRFI && (
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
                    {app.hasRFI && app.rfiIssuedDate && (
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

                  {/* ── Card footer: notes toggle + portal link ── */}
                  <div className="px-5 pb-5 pt-1">
                    <div className="h-px bg-gray-100 mb-4" />
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
                        {/* Green dot when notes exist and panel is closed */}
                        {notesText[app.referenceNumber]?.trim() && !notesOpen[app.referenceNumber] && (
                          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-green-500" />
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
        )}
      </div>

      {/* ── Add Application Modal ──────────────────────────────────────── */}
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
              className="px-5 sm:px-6 py-5 space-y-4 max-h-[80vh] overflow-y-auto"
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

    </div>
  );
}
