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
  clientEmail?: string;
  propertyAddress: string;
  projectDescription: string;
  status: ApplicationStatus;
  submissionDate: string;   // YYYY-MM-DD
  statutoryDeadline: string; // YYYY-MM-DD
  hasRFI: boolean;
  rfiIssuedDate?: string;
  decisionDate?: string;
  portalToken: string;
  council?: string;
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

// ─── Seeded demo data ──────────────────────────────────────────────────────────
// Dates are relative to 2026-03-22 (current demo date) so stats look live.

const SEED_APPLICATIONS: PlanningApplication[] = [
  {
    id: "1",
    referenceNumber: "DCC/2026/000421",
    clientName: "Sarah & James O'Brien",
    clientEmail: "sarah.obrien@gmail.com",
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
    clientEmail: "pconnolly@icloud.com",
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
    clientEmail: "dermot.murphy@murphyfamilytrust.ie",
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
    clientEmail: "aoife.brennan@hotmail.com",
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
  const [applications, setApplications] = useState<PlanningApplication[]>([]);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  // ── Profile / onboarding state ──
  const [isLoading,    setIsLoading]    = useState(true);
  const [hasProfile,   setHasProfile]   = useState(false);
  const [practiceName, setPracticeName] = useState("");

  // Onboarding form
  const [obPractice, setObPractice] = useState("");
  const [obRef,      setObRef]      = useState("");
  const [obClient,   setObClient]   = useState("");
  const [obEmail,    setObEmail]    = useState("");
  const [obAddress,  setObAddress]  = useState("");
  const [obCouncil,  setObCouncil]  = useState("");
  const [obSubDate,  setObSubDate]  = useState("");
  const [obLoading,  setObLoading]  = useState(false);
  const [obError,    setObError]    = useState<string | null>(null);

  // ── Notes state — keyed by referenceNumber ──
  const [notesOpen,   setNotesOpen]   = useState<Record<string, boolean>>({});
  const [notesText,   setNotesText]   = useState<Record<string, string>>({});
  const [notesStatus, setNotesStatus] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({});

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
      body: JSON.stringify({ referenceNumber: ref, clientName: client, clientEmail: email || undefined, propertyAddress: address, projectDescription: desc, status, submissionDate: sub, statutoryDeadline: dead, council: council || undefined }),
    }).catch(() => {});
  }

  // ── Load profile, applications, and notes on mount ──
  useEffect(() => {
    Promise.all([
      fetch("/api/architect-profile").then(r => r.json()),
      fetch("/api/planning-applications").then(r => r.json()),
      fetch("/api/application-notes").then(r => r.json()),
    ])
      .then(([profileData, appsData, notesData]) => {
        // Profile
        if (profileData.profile) {
          setHasProfile(true);
          setPracticeName(profileData.profile.practice_name ?? "");
        }
        // Applications — fall back to seed data if none in DB yet
        if (Array.isArray(appsData.applications) && appsData.applications.length > 0) {
          setApplications(appsData.applications);
        } else if (!profileData.profile) {
          // No profile at all — show onboarding (empty state is intentional)
          setApplications([]);
        } else {
          // Has profile but no apps — show empty dashboard
          setApplications([]);
        }
        // Notes
        if (Array.isArray(notesData.notes)) {
          setNotesText(
            Object.fromEntries(
              notesData.notes.map((n: { reference_number: string; notes: string }) => [
                n.reference_number,
                n.notes,
              ])
            )
          );
        }
      })
      .catch(() => {
        // Supabase not configured — fall back to demo seed data
        setHasProfile(true);
        setApplications(SEED_APPLICATIONS);
      })
      .finally(() => setIsLoading(false));
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

  // ── Onboarding submit ──
  async function handleOnboardingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setObLoading(true);
    setObError(null);

    try {
      // 1. Save practice profile
      const profileRes = await fetch("/api/architect-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ practiceName: obPractice }),
      });
      if (!profileRes.ok) {
        const d = await profileRes.json();
        throw new Error(d.error ?? "Failed to save practice details.");
      }

      // 2. Save first application (deadline defaults to submission + 8 weeks)
      const appRes = await fetch("/api/planning-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referenceNumber:  obRef,
          clientName:       obClient,
          clientEmail:      obEmail || undefined,
          propertyAddress:  obAddress,
          projectDescription: "",
          status:           "received",
          submissionDate:   obSubDate,
          council:          obCouncil,
        }),
      });
      if (!appRes.ok) {
        const d = await appRes.json();
        throw new Error(d.error ?? "Failed to save application.");
      }
      const appData = await appRes.json();

      // 3. Transition to dashboard
      setPracticeName(obPractice);
      setApplications([appData.application]);
      setHasProfile(true);
    } catch (err) {
      setObError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setObLoading(false);
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

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="w-8 h-8 text-green-600 mx-auto mb-3" />
          <p className="text-sm text-gray-400">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  // ── Onboarding ──
  if (!hasProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center">
            <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
              PlanAssist
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          <div className="w-full max-w-lg">

            {/* Welcome header */}
            <div className="mb-7 sm:mb-8">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center mb-5">
                <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 tracking-tight">
                Welcome to PlanAssist
              </h1>
              <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                Set up your architect dashboard in under a minute. We just need your practice name and first application.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleOnboardingSubmit} className="space-y-5">

              {/* Practice section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Your Practice
                </h2>
                <div>
                  <label className={labelCls} htmlFor="ob-practice">Practice name <span className="text-red-500">*</span></label>
                  <input
                    id="ob-practice"
                    type="text"
                    value={obPractice}
                    onChange={e => setObPractice(e.target.value)}
                    required
                    placeholder="e.g. Murphy Architecture Ltd"
                    className={inputCls}
                  />
                </div>
              </div>

              {/* First application section */}
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 space-y-4">
                <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  First Application
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls} htmlFor="ob-ref">Reference number <span className="text-red-500">*</span></label>
                    <input
                      id="ob-ref"
                      type="text"
                      value={obRef}
                      onChange={e => setObRef(e.target.value)}
                      required
                      placeholder="e.g. DCC/2026/001234"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls} htmlFor="ob-council">Planning authority <span className="text-red-500">*</span></label>
                    <select
                      id="ob-council"
                      value={obCouncil}
                      onChange={e => setObCouncil(e.target.value)}
                      required
                      className={inputCls + " appearance-none cursor-pointer"}
                    >
                      <option value="" disabled>Select authority…</option>
                      {COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className={labelCls} htmlFor="ob-client">Client name <span className="text-red-500">*</span></label>
                  <input
                    id="ob-client"
                    type="text"
                    value={obClient}
                    onChange={e => setObClient(e.target.value)}
                    required
                    placeholder="e.g. John & Mary Smith"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="ob-email">
                    Client email <span className="text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    id="ob-email"
                    type="email"
                    value={obEmail}
                    onChange={e => setObEmail(e.target.value)}
                    placeholder="client@example.com"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="ob-address">Property address <span className="text-red-500">*</span></label>
                  <input
                    id="ob-address"
                    type="text"
                    value={obAddress}
                    onChange={e => setObAddress(e.target.value)}
                    required
                    placeholder="e.g. 12 Oak Avenue, Blackrock, Co. Dublin"
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className={labelCls} htmlFor="ob-sub">Submission date <span className="text-red-500">*</span></label>
                  <input
                    id="ob-sub"
                    type="date"
                    value={obSubDate}
                    onChange={e => setObSubDate(e.target.value)}
                    required
                    className={inputCls}
                  />
                  <p className="mt-1.5 text-xs text-gray-400">
                    The statutory decision deadline will be calculated automatically as 8 weeks from this date.
                  </p>
                </div>
              </div>

              {/* Error */}
              {obError && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                  {obError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={obLoading}
                className="w-full flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition-colors text-sm"
              >
                {obLoading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    Setting up your dashboard…
                  </>
                ) : (
                  "Create my dashboard →"
                )}
              </button>

              <p className="text-center text-xs text-gray-400 pb-4">
                You can add more applications and edit details from the dashboard at any time.
              </p>
            </form>
          </div>
        </main>
      </div>
    );
  }

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
            <span className="hidden sm:block text-sm text-gray-400">
              {practiceName || "Architect Dashboard"}
            </span>
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

        {/* ── Deadline alert banner ──────────────────────────────────── */}
        {urgentApps.length > 0 && (
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

                  {/* ── Card footer: notes toggle + portal link + send update ── */}
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
