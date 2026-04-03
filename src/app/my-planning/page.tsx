"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell, ChevronDown, LogOut, User, Settings, MessageSquare, Star,
  FileSearch, Map, FileText, Ruler, Zap, Home,
  BookOpen, Newspaper, Plus, ExternalLink, HelpCircle, ClipboardList,
  X, CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import { createClient } from "@/lib/supabase/browser";

// ─── Types ─────────────────────────────────────────────────────────────────────

type AppStatus =
  | "received" | "validated" | "under_assessment" | "further_info"
  | "fi_response" | "decision_made" | "appeal" | "granted" | "refused"
  | "validation" | "on_display" | "decision_pending";

interface HApplication {
  id: string;
  referenceNumber: string;
  propertyAddress: string;
  status: AppStatus;
  submissionDate: string;
  council?: string;
}

type ToolDef = {
  label: string;
  description: string;
  href: string;
  Icon: LucideIcon;
  iconBg: string;
  iconText: string;
};

type SidebarLinkDef = {
  label: string;
  href: string;
  Icon: LucideIcon;
  external?: boolean;
};

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  received:         { label: "Received",            badge: "bg-gray-100 text-gray-600 border border-gray-200" },
  validated:        { label: "Validated",           badge: "bg-gray-100 text-gray-600 border border-gray-200" },
  validation:       { label: "In Validation",       badge: "bg-gray-100 text-gray-600 border border-gray-200" },
  under_assessment: { label: "Under Assessment",    badge: "bg-amber-100 text-amber-700 border border-amber-200" },
  on_display:       { label: "On Public Display",   badge: "bg-blue-100 text-blue-700 border border-blue-200" },
  further_info:     { label: "Further Info Needed", badge: "bg-red-100 text-red-700 border border-red-200" },
  fi_response:      { label: "Response Submitted",  badge: "bg-blue-100 text-blue-700 border border-blue-200" },
  decision_pending: { label: "Decision Pending",    badge: "bg-amber-100 text-amber-700 border border-amber-200" },
  decision_made:    { label: "Decision Made",       badge: "bg-green-100 text-green-700 border border-green-200" },
  appeal:           { label: "Under Appeal",        badge: "bg-orange-100 text-orange-700 border border-orange-200" },
  granted:          { label: "Permission Granted",  badge: "bg-green-100 text-green-700 border border-green-200" },
  refused:          { label: "Permission Refused",  badge: "bg-red-100 text-red-700 border border-red-200" },
};

// ─── Tools ─────────────────────────────────────────────────────────────────────

const TOOLS: ToolDef[] = [
  {
    label: "Document Interpreter",
    description: "Upload any planning document and get a plain-English summary of what it means for you.",
    href: "/interpreter",
    Icon: FileSearch,
    iconBg: "bg-green-100",
    iconText: "text-green-700",
  },
  {
    label: "County Intelligence",
    description: "Approval rates, typical decision timelines, and key planning trends for your local council.",
    href: "/check",
    Icon: Map,
    iconBg: "bg-blue-100",
    iconText: "text-blue-700",
  },
  {
    label: "County Document Library",
    description: "Browse local development plans, planning policies, and county design guidelines.",
    href: "/check",
    Icon: BookOpen,
    iconBg: "bg-purple-100",
    iconText: "text-purple-700",
  },
  {
    label: "Newspaper Finder",
    description: "Find newspaper public notices for planning applications in your area.",
    href: "/check",
    Icon: Newspaper,
    iconBg: "bg-amber-100",
    iconText: "text-amber-700",
  },
  {
    label: "Design Guide Checker",
    description: "Check if your proposed design meets local planning guidelines and standards.",
    href: "/design-check",
    Icon: Ruler,
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-700",
  },
  {
    label: "Planning Statement Generator",
    description: "Generate a clear, professional planning statement to support your application.",
    href: "/planning-statement",
    Icon: FileText,
    iconBg: "bg-teal-100",
    iconText: "text-teal-700",
  },
  {
    label: "SEAI Grants Checker",
    description: "Discover what SEAI home energy grants and schemes you may be eligible for.",
    href: "/grants",
    Icon: Zap,
    iconBg: "bg-yellow-100",
    iconText: "text-yellow-700",
  },
  {
    label: "Self-Build Tracker",
    description: "Step-by-step guidance through every stage of your self-build planning journey.",
    href: "/self-build",
    Icon: Home,
    iconBg: "bg-green-100",
    iconText: "text-green-700",
  },
];

// ─── Sidebar links ─────────────────────────────────────────────────────────────

const SIDEBAR_LINKS: SidebarLinkDef[] = [
  { label: "My Applications",      href: "#applications",         Icon: ClipboardList },
  { label: "Document Interpreter", href: "/interpreter",          Icon: FileSearch    },
  { label: "County Intelligence",  href: "/check",                Icon: Map           },
  { label: "SEAI Grants",          href: "/grants",               Icon: Zap           },
  { label: "Self-Build Tracker",   href: "/self-build",           Icon: Home          },
  { label: "Get Support",          href: "mailto:hello@granted.ie", Icon: HelpCircle, external: true },
];

// ─── Irish councils ────────────────────────────────────────────────────────────

const COUNCILS = [
  "Carlow County Council", "Cavan County Council", "Clare County Council",
  "Cork City Council", "Cork County Council", "Donegal County Council",
  "Dublin City Council", "Dún Laoghaire-Rathdown County Council", "Fingal County Council",
  "Galway City Council", "Galway County Council", "Kerry County Council",
  "Kildare County Council", "Kilkenny County Council", "Laois County Council",
  "Leitrim County Council", "Limerick City & County Council", "Longford County Council",
  "Louth County Council", "Mayo County Council", "Meath County Council",
  "Monaghan County Council", "Offaly County Council", "Roscommon County Council",
  "Sligo County Council", "South Dublin County Council", "Tipperary County Council",
  "Waterford City & County Council", "Westmeath County Council", "Wexford County Council",
  "Wicklow County Council",
];

// ─── Main component ────────────────────────────────────────────────────────────

export default function MyPlanningPage() {
  const router = useRouter();
  const { isLoggedIn, isPaid, isArchitect, loading: authLoading, userEmail } = useAuthStatus();

  const [userName, setUserName]           = useState("");
  const [applications, setApplications]   = useState<HApplication[]>([]);
  const [loadingApps, setLoadingApps]     = useState(true);
  const [showDropdown, setShowDropdown]   = useState(false);
  const [showAddModal, setShowAddModal]   = useState(false);
  const [activeTab, setActiveTab]         = useState<"home" | "applications" | "tools" | "support">("home");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Auth redirect
  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) { router.replace("/login?next=/my-planning"); return; }
    if (isArchitect)  { router.replace("/dashboard"); return; }
    if (!isPaid)      { router.replace("/planning-tools"); return; }
  }, [authLoading, isLoggedIn, isPaid, isArchitect, router]);

  // Fetch user display name
  useEffect(() => {
    if (!isLoggedIn || authLoading) return;
    async function fetchName() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, first_name, name")
          .eq("id", user.id)
          .maybeSingle();
        const raw = profile as Record<string, string> | null;
        const resolved = raw?.full_name || raw?.first_name || raw?.name || "";
        setUserName(resolved);
      } catch {
        // profiles table may not have name columns yet — use email fallback
      }
    }
    fetchName();
  }, [isLoggedIn, authLoading]);

  // Fetch applications
  useEffect(() => {
    if (!isLoggedIn || isArchitect || authLoading) return;
    async function fetchApps() {
      setLoadingApps(true);
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase
          .from("applications")
          .select("id, reference_number, property_address, status, submission_date, council")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });
        if (data) {
          setApplications(data.map(r => ({
            id:              r.id,
            referenceNumber: r.reference_number,
            propertyAddress: r.property_address,
            status:          r.status as AppStatus,
            submissionDate:  r.submission_date,
            council:         r.council ?? undefined,
          })));
        }
      } catch {
        // Table not yet migrated for homeowners — show empty state
      } finally {
        setLoadingApps(false);
      }
    }
    fetchApps();
  }, [isLoggedIn, isArchitect, authLoading]);

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const displayName = userName || userEmail?.split("@")[0] || "there";
  const firstName   = displayName.split(" ")[0];

  // Loading / redirect in-progress
  if (authLoading || (!isLoggedIn && !authLoading)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top navigation ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-green-700 z-40 flex items-center px-4 sm:px-6 gap-4 shadow-sm">

        {/* Logo */}
        <Link href="/my-planning" className="text-white font-bold text-lg tracking-tight shrink-0">
          Granted
        </Link>

        {/* Welcome message */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <p className="text-green-200 text-sm truncate">
            Welcome back, <span className="text-white font-semibold">{firstName}</span>
          </p>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 ml-auto shrink-0">

          {/* Bell */}
          <button
            aria-label="Notifications"
            className="w-9 h-9 flex items-center justify-center text-green-200 hover:text-white hover:bg-green-600 rounded-full transition-colors"
          >
            <Bell className="w-5 h-5" strokeWidth={1.75} />
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(v => !v)}
              className="flex items-center gap-1.5 text-green-100 hover:text-white transition-colors pl-1.5 pr-2.5 py-1.5 rounded-lg hover:bg-green-600"
            >
              <div className="w-7 h-7 rounded-full bg-green-500 border border-green-400 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                {firstName[0] ?? "U"}
              </div>
              <span className="text-sm font-medium hidden sm:block max-w-[120px] truncate">
                {firstName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-green-300" strokeWidth={2} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                {/* User info */}
                <div className="px-4 py-2.5 border-b border-gray-100 mb-1">
                  <p className="text-xs font-semibold text-gray-900 truncate">{displayName}</p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{userEmail}</p>
                </div>

                <DropdownLink href="/my-planning"    Icon={ClipboardList}  label="My Applications"  onClick={() => setShowDropdown(false)} />
                <DropdownLink href="/profile"        Icon={User}           label="My Profile"        onClick={() => setShowDropdown(false)} />
                <DropdownLink href="/account"        Icon={Settings}       label="Account Settings"  onClick={() => setShowDropdown(false)} />

                <div className="h-px bg-gray-100 my-1" />

                <DropdownAnchor href="mailto:hello@granted.ie"    Icon={MessageSquare} label="Request Support"  onClick={() => setShowDropdown(false)} />
                <DropdownAnchor href="mailto:feedback@granted.ie" Icon={Star}          label="Give Feedback"    onClick={() => setShowDropdown(false)} />

                <div className="h-px bg-gray-100 my-1" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  Log Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Page layout ─────────────────────────────────────────────────────── */}
      <div className="flex pt-14 pb-16 lg:pb-0">

        {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-56 fixed left-0 top-14 bottom-0 bg-white border-r border-gray-200 overflow-y-auto">
          <nav className="p-3 pt-4">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-3 pb-2">
              Quick links
            </p>
            <div className="space-y-0.5">
              {SIDEBAR_LINKS.map(link => (
                <SidebarLink key={link.label} {...link} />
              ))}
            </div>
          </nav>

          {/* Help callout */}
          <div className="mt-auto p-4">
            <a
              href="mailto:hello@granted.ie"
              className="block bg-green-50 border border-green-100 rounded-xl p-3.5 hover:bg-green-100 transition-colors"
            >
              <p className="text-xs font-semibold text-green-800 mb-0.5">Questions?</p>
              <p className="text-xs text-green-700 leading-relaxed">
                Email us at hello@granted.ie — we reply within 24 hours.
              </p>
            </a>
          </div>
        </aside>

        {/* ── Main content ─────────────────────────────────────────────────── */}
        <main className="flex-1 lg:ml-56 min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10">

            {/* ── My Applications ─────────────────────────────────────────── */}
            <section id="applications">
              <div className="flex items-center justify-between mb-4 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">My Applications</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {loadingApps
                      ? "Loading…"
                      : applications.length === 0
                        ? "No applications tracked yet"
                        : `${applications.length} application${applications.length !== 1 ? "s" : ""} monitored`}
                  </p>
                </div>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="shrink-0 flex items-center gap-1.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Application</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>

              {loadingApps ? (
                <div className="space-y-3">
                  {[1, 2].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded-lg w-1/3" />
                          <div className="h-3 bg-gray-100 rounded-lg w-2/3" />
                        </div>
                        <div className="h-6 w-28 bg-gray-100 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : applications.length === 0 ? (
                <EmptyApplicationsState onAdd={() => setShowAddModal(true)} />
              ) : (
                <div className="space-y-3">
                  {applications.map(app => (
                    <ApplicationCard key={app.id} app={app} />
                  ))}
                </div>
              )}
            </section>

            {/* ── My Tools ────────────────────────────────────────────────── */}
            <section id="tools">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">My Tools</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  All planning tools included with your Granted account.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
                {TOOLS.map(tool => (
                  <ToolCard key={tool.label} tool={tool} />
                ))}
              </div>
            </section>

          </div>
        </main>
      </div>

      {/* ── Mobile bottom navigation ─────────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around px-2 pt-1 pb-2">
          {([
            { key: "home",         label: "Home",         Icon: Home,          href: "/my-planning"           },
            { key: "applications", label: "Applications", Icon: ClipboardList, href: "#applications"          },
            { key: "tools",        label: "Tools",        Icon: Star,          href: "#tools"                 },
            { key: "support",      label: "Support",      Icon: HelpCircle,    href: "mailto:hello@granted.ie" },
          ] as const).map(({ key, label, Icon, href }) => (
            <a
              key={key}
              href={href}
              onClick={() => setActiveTab(key)}
              className={`flex flex-col items-center gap-0.5 py-2 px-4 rounded-xl min-w-[64px] transition-colors ${
                activeTab === key
                  ? "text-green-700 bg-green-50"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon
                className="w-5 h-5"
                strokeWidth={activeTab === key ? 2.5 : 1.75}
              />
              <span className="text-[10px] font-medium leading-none">{label}</span>
            </a>
          ))}
        </div>
      </nav>

      {/* ── Add Application modal ────────────────────────────────────────── */}
      {showAddModal && (
        <AddApplicationModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(app) => {
            setApplications(prev => [app, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// ─── Subcomponents ─────────────────────────────────────────────────────────────

function DropdownLink({
  href, Icon, label, onClick,
}: {
  href: string; Icon: LucideIcon; label: string; onClick: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      {label}
    </Link>
  );
}

function DropdownAnchor({
  href, Icon, label, onClick,
}: {
  href: string; Icon: LucideIcon; label: string; onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      {label}
    </a>
  );
}

function SidebarLink({ label, href, Icon, external }: SidebarLinkDef) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-sm group"
    >
      <Icon className="w-4 h-4 text-gray-400 group-hover:text-green-600 shrink-0 transition-colors" strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {external && <ExternalLink className="w-3 h-3 text-gray-300 shrink-0" />}
    </a>
  );
}

function ApplicationCard({ app }: { app: HApplication }) {
  const statusCfg = STATUS_CONFIG[app.status] ?? { label: app.status, badge: "bg-gray-100 text-gray-600 border border-gray-200" };
  const submittedDate = app.submissionDate
    ? new Date(app.submissionDate).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" })
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 hover:border-green-200 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-gray-900">{app.referenceNumber}</span>
            {app.council && (
              <span className="text-xs text-gray-400 font-medium">{app.council}</span>
            )}
          </div>
          <p className="text-sm text-gray-600 mt-0.5 truncate">{app.propertyAddress}</p>
          {submittedDate && (
            <p className="text-xs text-gray-400 mt-1.5">
              Submitted {submittedDate}
            </p>
          )}
        </div>
        <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${statusCfg.badge}`}>
          {statusCfg.label}
        </span>
      </div>
    </div>
  );
}

function EmptyApplicationsState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="bg-white rounded-2xl border-2 border-dashed border-green-200 p-8 sm:p-12 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
        <CheckCircle2 className="w-8 h-8 text-green-600" strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">Welcome to Granted!</h3>
      <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed mb-2">
        Here&apos;s what you have access to with your Granted account.
      </p>
      <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed mb-6">
        Start by adding your planning application reference number to monitor it in real time — you&apos;ll get updates on every stage of the process.
      </p>
      <button
        onClick={onAdd}
        className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
      >
        <Plus className="w-4 h-4" />
        Add My Planning Reference
      </button>
    </div>
  );
}

function ToolCard({ tool }: { tool: ToolDef }) {
  return (
    <Link
      href={tool.href}
      className="group bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 hover:border-green-300 hover:shadow-sm transition-all flex flex-col gap-3"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${tool.iconBg} transition-transform group-hover:scale-105`}>
          <tool.Icon className={`w-5 h-5 ${tool.iconText}`} strokeWidth={1.75} />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 text-sm leading-snug">{tool.label}</h3>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">{tool.description}</p>
        </div>
      </div>
      <div className="mt-auto pt-1 border-t border-gray-100">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 group-hover:text-green-800 transition-colors">
          Open tool
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </Link>
  );
}

function AddApplicationModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (app: HApplication) => void;
}) {
  const [refNum,  setRefNum]  = useState("");
  const [address, setAddress] = useState("");
  const [council, setCouncil] = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!refNum.trim() || !address.trim()) {
      setError("Please fill in the reference number and address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      const today    = new Date().toISOString().split("T")[0];
      const deadline = new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

      const { data, error: dbError } = await supabase
        .from("applications")
        .insert({
          user_id:            user.id,
          reference_number:   refNum.trim(),
          client_name:        "Self",
          property_address:   address.trim(),
          status:             "received",
          submission_date:    today,
          statutory_deadline: deadline,
          council:            council || null,
        })
        .select("id, reference_number, property_address, status, submission_date, council")
        .single();

      if (dbError) throw dbError;

      onSuccess({
        id:              data.id,
        referenceNumber: data.reference_number,
        propertyAddress: data.property_address,
        status:          data.status as AppStatus,
        submissionDate:  data.submission_date,
        council:         data.council ?? undefined,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Add Planning Application</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Planning Reference Number <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={refNum}
              onChange={e => setRefNum(e.target.value)}
              placeholder="e.g. DCC/2024/12345"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
            <p className="text-xs text-gray-400 mt-1.5">
              Find this on your planning documentation or the council&apos;s online portal.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Property Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              placeholder="e.g. 12 Main Street, Dublin 2"
              required
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Local Council
            </label>
            <select
              value={council}
              onChange={e => setCouncil(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white transition-colors"
            >
              <option value="">Select your council…</option>
              {COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? "Adding…" : "Add Application"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
