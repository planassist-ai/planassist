"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  // Shell chrome
  Bell, ChevronDown, Plus, LogOut, ExternalLink, Mail,
  // User dropdown
  LayoutDashboard, User, CreditCard, Users, MessageSquare, Star,
  // Planning group
  CheckCircle2, Calculator, Map, Newspaper,
  // Applications group
  FileSearch, FileText, Ruler, Activity, Home,
  // Resources group
  Zap, Calendar,
  // Settings
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface DashboardShellProps {
  children: React.ReactNode;
  applicationCount?: number;
  urgentCount?: number;
  practiceName?: string;
  isDemoMode?: boolean;
  onAddApplication?: () => void;
  onOpenFeeModal?: () => void;
  onOpenNoticeModal?: () => void;
  breadcrumb?: Array<{ label: string; href?: string }>;
}

// ─── Nav data ───────────────────────────────────────────────────────────────────

type NavItem = {
  label: string;
  icon: LucideIcon;
  href?: string;
  modal?: "fee" | "notice";
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

// Only live, fully-built tools. No coming-soon items.
const NAV_GROUPS: NavGroup[] = [
  {
    title: "Planning",
    items: [
      { label: "Permission Checker",   icon: CheckCircle2,  href: "/check"              },
      { label: "County Intelligence",  icon: Map,           href: "/check"              },
      { label: "Fee Calculator",       icon: Calculator,    modal: "fee"                },
      { label: "Notice Generator",     icon: Newspaper,     modal: "notice"             },
    ],
  },
  {
    title: "Applications",
    items: [
      { label: "Document Interpreter", icon: FileSearch,    href: "/interpreter"        },
      { label: "Planning Statement",   icon: FileText,      href: "/planning-statement" },
      { label: "Design Checker",       icon: Ruler,         href: "/design-check"       },
      { label: "Self-Build Guide",     icon: Home,          href: "/self-build"         },
    ],
  },
  {
    title: "Workspace",
    items: [
      { label: "Application Timeline", icon: Activity,      href: "/dashboard/timeline"       },
      { label: "Deadline Calendar",    icon: Calendar,      href: "/dashboard/calendar"       },
      { label: "Email Templates",      icon: Mail,          href: "/dashboard/email-templates" },
    ],
  },
  {
    title: "Resources",
    items: [
      { label: "Find a Professional",  icon: Users,         href: "/find-a-professional" },
      { label: "SEAI Grants",          icon: Zap,           href: "/grants"              },
    ],
  },
];

// ─── Top nav links ───────────────────────────────────────────────────────────────

const TOP_NAV = [
  { href: "/dashboard",           label: "Dashboard" },
  { href: "/planning-tools",      label: "Planning Tools" },
  { href: "/find-a-professional", label: "Find a Professional" },
  { href: "/check",               label: "County Intelligence" },
];

// ─── Sidebar item ───────────────────────────────────────────────────────────────

function SidebarItem({
  item,
  active,
  iconOnly,
  onClickCallback,
}: {
  item: NavItem;
  active: boolean;
  iconOnly: boolean;
  onClickCallback?: () => void;
}) {
  const Icon = item.icon;

  const cls = [
    "group relative flex items-center rounded-md transition-colors w-full text-left",
    iconOnly ? "justify-center w-9 h-9 mx-auto" : "px-2.5 py-[7px]",
    active
      ? "bg-blue-600 text-white"
      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70",
  ].join(" ");

  const content = (
    <>
      <Icon
        className={iconOnly ? "w-[15px] h-[15px] shrink-0" : "w-[14px] h-[14px] shrink-0"}
        strokeWidth={active ? 2.5 : 1.5}
      />

      {!iconOnly && (
        <span className={`ml-2 flex-1 min-w-0 truncate text-[13px] leading-tight ${
          active ? "font-semibold text-white" : "font-normal text-slate-300"
        }`}>
          {item.label}
        </span>
      )}

      {/* Fly-out tooltip in icon-only mode */}
      {iconOnly && (
        <span
          role="tooltip"
          className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[60]
                     whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg
                     opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        >
          {item.label}
        </span>
      )}
    </>
  );

  if (onClickCallback && !item.href) {
    return <button className={cls} onClick={onClickCallback}>{content}</button>;
  }
  if (item.href) {
    return <Link href={item.href} className={cls} onClick={onClickCallback}>{content}</Link>;
  }
  return null;
}

// ─── Sidebar content (shared desktop + mobile) ──────────────────────────────────

function SidebarContent({
  pathname,
  applicationCount,
  practiceName,
  isDemoMode,
  onAddApplication,
  onOpenFeeModal,
  onOpenNoticeModal,
  onClose,
  iconOnly = false,
}: {
  pathname: string;
  applicationCount: number;
  practiceName: string;
  isDemoMode: boolean;
  onAddApplication?: () => void;
  onOpenFeeModal?: () => void;
  onOpenNoticeModal?: () => void;
  onClose?: () => void;
  iconOnly?: boolean;
}) {
  const isActive = (href?: string) => {
    if (!href) return false;
    return href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname.startsWith(href + "/");
  };

  function resolveClick(item: NavItem): (() => void) | undefined {
    if (item.modal === "fee")    return () => { onClose?.(); onOpenFeeModal?.();    };
    if (item.modal === "notice") return () => { onClose?.(); onOpenNoticeModal?.(); };
    if (item.href)               return onClose ? () => onClose() : undefined;
    return undefined;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Practice header */}
      {!iconOnly && (
        <div className="px-3 pt-4 pb-3 border-b border-slate-800 shrink-0">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Practice</p>
          <p className="text-sm font-semibold text-white truncate leading-snug">
            {isDemoMode ? "Murphy Architecture" : practiceName || "Your Practice"}
          </p>
          {isDemoMode && (
            <span className="mt-1 inline-block text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Demo
            </span>
          )}
        </div>
      )}

      {/* Add Application CTA */}
      <div className={`shrink-0 ${iconOnly ? "px-1.5 py-2.5" : "px-3 py-3"}`}>
        {iconOnly ? (
          <div className="group relative flex justify-center">
            <button
              onClick={() => { onClose?.(); onAddApplication?.(); }}
              className="w-9 h-9 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-md transition-colors"
              aria-label="Add Application"
            >
              <Plus className="w-4 h-4" />
            </button>
            <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[60] whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Add Application
            </span>
          </div>
        ) : (
          <button
            onClick={() => { onClose?.(); onAddApplication?.(); }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-[13px] font-semibold py-2 px-3 rounded-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Application
          </button>
        )}
      </div>

      {/* Pipeline — always at top */}
      <div className={`shrink-0 ${iconOnly ? "px-1.5 pb-2" : "px-3 pb-3"} border-b border-slate-800`}>
        {!iconOnly && (
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
            Pipeline
          </p>
        )}
        <div className="group relative flex justify-center lg:block">
          <Link
            href="/dashboard"
            onClick={onClose}
            className={`group/item relative flex items-center rounded-md transition-colors w-full
              ${iconOnly ? "justify-center p-2 w-9 h-9 mx-auto" : "px-2.5 py-1.5 gap-2.5"}
              ${pathname === "/dashboard"
                ? "bg-blue-600 text-white"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"
              }`}
          >
            <LayoutDashboard
              className="w-[15px] h-[15px] shrink-0"
              strokeWidth={pathname === "/dashboard" ? 2.5 : 1.75}
            />
            {!iconOnly && (
              <>
                <span className={`flex-1 text-[13px] leading-tight ${pathname === "/dashboard" ? "font-semibold text-white" : "font-medium"}`}>
                  All Applications
                </span>
                <span className={`text-xs font-semibold tabular-nums shrink-0 ${pathname === "/dashboard" ? "text-blue-200" : "text-slate-500"}`}>
                  {applicationCount}
                </span>
              </>
            )}
            {iconOnly && (
              <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[60] whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg opacity-0 group/item-hover:opacity-100 transition-opacity">
                All Applications
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Grouped nav sections */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
        {NAV_GROUPS.map((group) => {
          const items = group.items;

          return (
            <div key={group.title} className={iconOnly ? "py-1" : "py-2"}>
              {/* Section header — hidden in icon-only mode */}
              {!iconOnly && (
                <p className="px-2.5 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {group.title}
                </p>
              )}

              {/* Divider in icon-only mode */}
              {iconOnly && (
                <div className="mx-2 mb-1 h-px bg-slate-800" />
              )}

              <div className={iconOnly ? "flex flex-col items-center gap-0.5 px-1.5" : "space-y-0.5"}>
                {items.map((item) => (
                  <SidebarItem
                    key={item.label}
                    item={item}
                    active={!item.modal && isActive(item.href)}
                    iconOnly={iconOnly}
                    onClickCallback={resolveClick(item)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Settings footer */}
      <div className={`shrink-0 border-t border-slate-800 ${iconOnly ? "px-1.5 py-2.5 flex justify-center" : "px-3 py-2"}`}>
        {iconOnly ? (
          <div className="group relative">
            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
            >
              <Settings className="w-4 h-4" strokeWidth={1.75} />
            </Link>
            <span className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[60] whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              Settings
            </span>
          </div>
        ) : (
          <Link
            href="/dashboard/settings"
            onClick={onClose}
            className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <Settings className="w-[15px] h-[15px]" strokeWidth={1.75} />
            <span className="text-[13px] font-medium">Settings</span>
          </Link>
        )}
      </div>

    </div>
  );
}

// ─── Dropdown item ───────────────────────────────────────────────────────────────

function DropdownItem({
  href,
  label,
  icon: Icon,
  external,
  onClick,
}: {
  href?: string;
  label: string;
  icon?: LucideIcon;
  external?: boolean;
  onClick?: () => void;
}) {
  const cls = "flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors w-full text-left";
  const inner = (
    <>
      {Icon && <Icon className="w-[15px] h-[15px] text-gray-400 shrink-0" strokeWidth={1.75} />}
      <span className="flex-1">{label}</span>
      {external && <ExternalLink className="w-3 h-3 text-gray-300" />}
    </>
  );

  // Internal nav link — use Next.js Link so it stays in the SPA without a full reload
  if (href && !external) {
    return (
      <Link href={href} className={cls} onClick={onClick}>
        {inner}
      </Link>
    );
  }

  // External link (mailto, https)
  if (href && external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={onClick}>
        {inner}
      </a>
    );
  }

  // No href — button only (e.g. Invite a Colleague opens a modal)
  return <button className={cls} onClick={onClick}>{inner}</button>;
}

// ─── Invite Colleague Modal ──────────────────────────────────────────────────────

function InviteModal({ onClose, userEmail }: { onClose: () => void; userEmail: string | null }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function send(e: React.FormEvent) {
    e.preventDefault();
    const subject = encodeURIComponent("Join me on Granted — planning tools for architects");
    const body = encodeURIComponent(
      `Hi,\n\nI've been using Granted (https://granted.ie) to manage planning applications and thought you might find it useful.\n\nIt has tools for managing the full planning pipeline — deadline tracking, document interpretation, notice generation, and client portal links.\n\nYou can sign up at https://granted.ie/signup?type=architect\n\nBest,\n${userEmail ?? "Your colleague"}`
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-900">Invite a Colleague</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {sent ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-gray-900 mb-1">Email client opened</p>
            <p className="text-xs text-gray-500">Send the pre-filled message to invite your colleague.</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={send} className="space-y-4">
            <p className="text-sm text-gray-600">We&apos;ll open your email client with a pre-written invite.</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Colleague&apos;s email address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="colleague@practice.ie"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-300 text-sm font-medium text-gray-700 rounded-xl hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                Open Email Client
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── DashboardShell ─────────────────────────────────────────────────────────────

export function DashboardShell({
  children,
  applicationCount = 0,
  urgentCount = 0,
  practiceName = "",
  isDemoMode = false,
  onAddApplication,
  onOpenFeeModal,
  onOpenNoticeModal,
  breadcrumb,
}: DashboardShellProps) {
  const pathname  = usePathname();
  const { userEmail } = useAuthStatus();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const avatarInitial = isDemoMode ? "M" : userEmail ? userEmail[0].toUpperCase() : "A";
  const avatarBg      = isDemoMode ? "bg-amber-500" : "bg-blue-700";

  const isTopNavActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const notifCount = urgentCount;

  const sharedSidebarProps = {
    pathname,
    applicationCount,
    practiceName,
    isDemoMode,
    onAddApplication,
    onOpenFeeModal,
    onOpenNoticeModal,
  };

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">
      {showInviteModal && (
        <InviteModal onClose={() => setShowInviteModal(false)} userEmail={userEmail} />
      )}

      {/* ── Top navigation bar ─────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">

        {/* Logo — pushed right of the icon sidebar on mobile */}
        <div className="w-9 lg:hidden shrink-0" /> {/* spacer matching icon rail */}
        <Link
          href="/"
          className="text-[1.15rem] font-bold text-blue-600 tracking-tight shrink-0 mr-2"
        >
          Granted
        </Link>

        {/* Top nav links — desktop only */}
        <nav className="hidden lg:flex items-center gap-0.5 flex-1">
          {TOP_NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isTopNavActive(href)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right: notifications + avatar */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Notifications bell */}
          <button
            className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={notifCount > 0 ? `${notifCount} urgent alerts` : "Notifications"}
          >
            <Bell className="w-5 h-5" strokeWidth={1.75} />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[1rem] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5 leading-none">
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>

          {/* User avatar + dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(v => !v)}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                {avatarInitial}
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`}
                strokeWidth={2.5}
              />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
                {/* User header */}
                <div className="px-4 py-3.5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {isDemoMode ? "Murphy Architecture" : practiceName || "Architect"}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {isDemoMode ? "demo@murphy-architecture.ie" : (userEmail ?? "")}
                  </p>
                </div>

                <div className="py-1">
                  <DropdownItem href="/dashboard"          label="My Applications"       icon={LayoutDashboard} onClick={() => setDropdownOpen(false)} />
                  <DropdownItem href="/dashboard/profile"  label="My Profile"             icon={User}            onClick={() => setDropdownOpen(false)} />
                  <DropdownItem href="/dashboard/settings" label="Account Settings"       icon={Settings}        onClick={() => setDropdownOpen(false)} />
                  <DropdownItem href="/dashboard/billing"  label="Billing & Subscription" icon={CreditCard}      onClick={() => setDropdownOpen(false)} />
                  <DropdownItem label="Invite a Colleague" icon={Users} onClick={() => { setDropdownOpen(false); setShowInviteModal(true); }} />
                </div>

                <div className="border-t border-gray-100 py-1">
                  <DropdownItem href="mailto:hello@granted.ie"                   label="Request Support" icon={MessageSquare} external />
                  <DropdownItem href="mailto:hello@granted.ie?subject=Feedback"  label="Give Feedback"   icon={Star}          external />
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => { window.location.href = "/api/auth/logout"; }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-[15px] h-[15px] shrink-0" strokeWidth={1.75} />
                    Log Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Body: sidebar + main ──────────────────────────────────────────────── */}
      <div className="flex flex-1 pt-14">

        {/* ── Icon rail — mobile / tablet (always visible, < lg) ─────────── */}
        <aside className="lg:hidden fixed left-0 top-14 bottom-0 w-12 bg-slate-900 z-30 overflow-y-auto overflow-x-visible">
          <SidebarContent {...sharedSidebarProps} iconOnly />
        </aside>

        {/* ── Full sidebar — desktop (lg+) ───────────────────────────────── */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-14 bottom-0 w-64 bg-slate-900 z-30 overflow-y-auto">
          <SidebarContent {...sharedSidebarProps} />
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <main className="flex-1 ml-12 lg:ml-64 min-w-0 flex flex-col">

          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 h-10 flex items-center shrink-0">
            <nav className="flex items-center gap-1.5 text-xs text-gray-400" aria-label="Breadcrumb">
              <Link href="/dashboard" className="hover:text-gray-700 transition-colors font-medium">
                Dashboard
              </Link>
              {breadcrumb?.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  <svg className="w-3 h-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className={`transition-colors ${i === (breadcrumb?.length ?? 0) - 1 ? "text-gray-700 font-semibold" : "hover:text-gray-700"}`}
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-gray-700 font-semibold">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>

          {/* Page content */}
          <div className="flex-1">
            {children}
          </div>

          {/* Footer */}
          <footer className="border-t border-gray-200 bg-white px-4 sm:px-6 py-4 shrink-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  Terms
                </Link>
                <a href="mailto:hello@granted.ie" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  Contact Support
                </a>
                <span className="text-xs text-gray-300">Granted v0.1 Beta</span>
              </div>
              <span className="text-xs text-gray-300">© 2026 Granted. All rights reserved.</span>
            </div>
          </footer>

        </main>
      </div>

    </div>
  );
}
