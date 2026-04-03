"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  // Shell chrome
  Bell, ChevronDown, Plus, LogOut, ExternalLink,
  // User dropdown
  LayoutDashboard, User, CreditCard, Users, MessageSquare, Star,
  // PLANNING
  CheckCircle2, ClipboardList, FileQuestion, Calculator, Map, Newspaper,
  // APPLICATIONS
  FileSearch, FileText, Ruler, ShieldCheck, MessageSquarePlus, ListChecks, Activity,
  // CLIENTS
  Globe, Upload, Mail, Clock,
  // GRANTS & FINANCE
  Zap, Landmark,
  // SELF BUILD
  Home, Circle,
  // DIRECTORIES
  HardHat,
  // Settings
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import { createClient } from "@/lib/supabase/browser";

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
  comingSoon?: boolean;
  sub?: boolean; // indented sub-item (self-build stages)
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Planning",
    items: [
      { label: "Permission Checker",         icon: CheckCircle2,     href: "/check"              },
      { label: "Document Checklist",          icon: ClipboardList,    href: "/checklist"          },
      { label: "Local Needs Questionnaire",   icon: FileQuestion,                  comingSoon: true },
      { label: "Fee Calculator",              icon: Calculator,       modal: "fee"                },
      { label: "County Intelligence",         icon: Map,              href: "/check"              },
      { label: "Newspaper Finder",            icon: Newspaper,        modal: "notice"             },
    ],
  },
  {
    title: "Applications",
    items: [
      { label: "Document Interpreter",        icon: FileSearch,       href: "/interpreter"        },
      { label: "Planning Statement",          icon: FileText,         href: "/planning-statement" },
      { label: "Design Guide Checker",        icon: Ruler,            href: "/design-check"       },
      { label: "Pre-Submission Validator",    icon: ShieldCheck,                   comingSoon: true },
      { label: "RFI Drafting Assistant",      icon: MessageSquarePlus,             comingSoon: true },
      { label: "Conditions Tracker",          icon: ListChecks,                    comingSoon: true },
      { label: "Application Monitoring",      icon: Activity,         href: "/status"             },
    ],
  },
  {
    title: "Clients",
    items: [
      { label: "Client Portal",               icon: Globe,            href: "/dashboard"          },
      { label: "Client Document Upload",      icon: Upload,                        comingSoon: true },
      { label: "One-Click Client Email",      icon: Mail,             href: "/dashboard"          },
      { label: "Activity Log",                icon: Clock,            href: "/dashboard"          },
    ],
  },
  {
    title: "Grants & Finance",
    items: [
      { label: "SEAI Grants Checker",         icon: Zap,              href: "/grants"             },
      { label: "Bank Drawdown Checklist",     icon: Landmark,                      comingSoon: true },
    ],
  },
  {
    title: "Self Build",
    items: [
      { label: "Self-Build Tracker",          icon: Home,             href: "/self-build"         },
      { label: "1 · Site Assessment",         icon: Circle, sub: true,             comingSoon: true },
      { label: "2 · Planning Permission",     icon: Circle, sub: true,             comingSoon: true },
      { label: "3 · Design & Engineering",    icon: Circle, sub: true,             comingSoon: true },
      { label: "4 · Foundations",             icon: Circle, sub: true,             comingSoon: true },
      { label: "5 · Structure & Roof",        icon: Circle, sub: true,             comingSoon: true },
      { label: "6 · Services & Insulation",   icon: Circle, sub: true,             comingSoon: true },
      { label: "7 · Internal Fit-Out",        icon: Circle, sub: true,             comingSoon: true },
      { label: "8 · Snagging & Handover",     icon: Circle, sub: true,             comingSoon: true },
    ],
  },
  {
    title: "Directories",
    items: [
      { label: "Find a Professional",         icon: Users,            href: "/find-a-professional" },
      { label: "Find a Builder",              icon: HardHat,          href: "/find-a-professional" },
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

  const baseItemCls = `
    group relative flex items-center rounded-md transition-colors w-full text-left
    ${iconOnly ? "justify-center px-0 py-2.5 mx-auto w-9 h-9" : item.sub ? "pl-7 pr-2 py-1.5" : "px-2.5 py-1.5"}
    ${active
      ? "bg-blue-600 text-white"
      : item.comingSoon
      ? "text-slate-600 cursor-default"
      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800 cursor-pointer"}
  `;

  const iconCls = iconOnly
    ? "w-4 h-4 shrink-0"
    : item.sub
    ? "w-3 h-3 shrink-0 opacity-40"
    : "w-[15px] h-[15px] shrink-0";

  const content = (
    <>
      <Icon
        className={`${iconCls} ${active ? "text-white" : item.comingSoon ? "text-slate-600" : ""}`}
        strokeWidth={active ? 2.5 : 1.75}
      />
      {!iconOnly && (
        <>
          <span className={`flex-1 min-w-0 truncate text-[13px] leading-tight ml-2 ${
            active ? "font-semibold text-white" : item.comingSoon ? "text-slate-600" : "font-medium"
          }`}>
            {item.label}
          </span>
          {item.comingSoon && (
            <span className="ml-1.5 text-[9px] font-bold uppercase tracking-wider bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded shrink-0">
              Soon
            </span>
          )}
        </>
      )}

      {/* Tooltip — only visible in icon-only mode on hover */}
      {iconOnly && (
        <span
          className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[60]
                     whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white shadow-lg
                     opacity-0 group-hover:opacity-100 transition-opacity duration-150"
          role="tooltip"
        >
          {item.label}
          {item.comingSoon && <span className="ml-1.5 text-gray-400">· soon</span>}
        </span>
      )}
    </>
  );

  // Coming-soon items are non-interactive
  if (item.comingSoon && !iconOnly) {
    return <div className={baseItemCls}>{content}</div>;
  }

  if (item.comingSoon && iconOnly) {
    return <div className={`${baseItemCls} opacity-50`}>{content}</div>;
  }

  if (onClickCallback && !item.href) {
    return (
      <button className={baseItemCls} onClick={onClickCallback}>
        {content}
      </button>
    );
  }

  if (item.href) {
    return (
      <Link href={item.href} className={baseItemCls} onClick={onClickCallback}>
        {content}
      </Link>
    );
  }

  return <div className={baseItemCls}>{content}</div>;
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
          // In icon-only mode, filter out sub-items (self-build stages)
          const items = iconOnly ? group.items.filter(i => !i.sub) : group.items;

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
                    active={!item.modal && !item.comingSoon && isActive(item.href)}
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
              href="/dashboard"
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
            href="/dashboard"
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
}: {
  href: string;
  label: string;
  icon?: LucideIcon;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {Icon && <Icon className="w-[15px] h-[15px] text-gray-400 shrink-0" strokeWidth={1.75} />}
      <span className="flex-1">{label}</span>
      {external && <ExternalLink className="w-3 h-3 text-gray-300" />}
    </a>
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
  const router    = useRouter();
  const { userEmail } = useAuthStatus();

  const [dropdownOpen, setDropdownOpen] = useState(false);
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

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

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

      {/* ── Top navigation bar ─────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">

        {/* Logo — pushed right of the icon sidebar on mobile */}
        <div className="w-9 lg:hidden shrink-0" /> {/* spacer matching icon rail */}
        <Link
          href="/"
          className="text-[1.15rem] font-bold text-green-600 tracking-tight shrink-0 mr-2"
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
                  <DropdownItem href="/dashboard" label="My Applications"       icon={LayoutDashboard} />
                  <DropdownItem href="/dashboard" label="My Profile"             icon={User} />
                  <DropdownItem href="/dashboard" label="Account Settings"       icon={Settings} />
                  <DropdownItem href="/dashboard" label="Billing & Subscription" icon={CreditCard} />
                  <DropdownItem href="/dashboard" label="Invite a Colleague"     icon={Users} />
                </div>

                <div className="border-t border-gray-100 py-1">
                  <DropdownItem href="mailto:hello@granted.ie"                   label="Request Support" icon={MessageSquare} external />
                  <DropdownItem href="mailto:hello@granted.ie?subject=Feedback"  label="Give Feedback"   icon={Star}          external />
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => { setDropdownOpen(false); handleSignOut(); }}
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
