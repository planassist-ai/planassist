"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";
import { createClient } from "@/lib/supabase/browser";

// ─── Icons ─────────────────────────────────────────────────────────────────────

const Ic = {
  Menu: (p: { className?: string }) => (
    <svg className={p.className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  X: (p: { className?: string }) => (
    <svg className={p.className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Bell: (p: { className?: string }) => (
    <svg className={p.className ?? "w-5 h-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
  ChevronDown: (p: { className?: string }) => (
    <svg className={p.className ?? "w-3.5 h-3.5"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  Plus: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Grid: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  Document: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  Map: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
    </svg>
  ),
  Newspaper: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
    </svg>
  ),
  Calculator: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-7.5-6.75h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V13.5zm0 2.25h.008v.008H8.25v-.008zm0 2.25h.008v.008H8.25V18zm2.498-6.75h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V13.5zm0 2.25h.007v.008h-.007v-.008zm0 2.25h.007v.008h-.007V18zm2.504-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zm0 2.25h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V18zm2.498-6.75h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V13.5zM8.25 6h7.5v2.25h-7.5V6zM12 2.25c-1.892 0-3.758.11-5.593.322C5.307 2.7 4.5 3.522 4.5 4.5v15a2.25 2.25 0 002.25 2.25h10.5A2.25 2.25 0 0019.5 19.5v-15c0-.978-.807-1.8-1.907-1.928A48.507 48.507 0 0012 2.25z" />
    </svg>
  ),
  Clock: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ListCheck: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Settings: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  LogOut: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
    </svg>
  ),
  User: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  CreditCard: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  Users: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  Chat: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  Star: (p: { className?: string }) => (
    <svg className={p.className ?? "w-4 h-4"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  ExternalLink: (p: { className?: string }) => (
    <svg className={p.className ?? "w-3 h-3"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
    </svg>
  ),
};

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

// ─── Top nav links ───────────────────────────────────────────────────────────────

const TOP_NAV = [
  { href: "/dashboard",           label: "Dashboard" },
  { href: "/planning-tools",      label: "Planning Tools" },
  { href: "/find-a-professional", label: "Find a Professional" },
  { href: "/check",               label: "County Intelligence" },
];

// ─── Sidebar sub-components ─────────────────────────────────────────────────────

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="px-3 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {title}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

function SidebarLink({
  href,
  label,
  icon: Icon,
  count,
  active,
  comingSoon,
  onClick,
}: {
  href?: string;
  label: string;
  icon?: (p: { className?: string }) => React.ReactElement;
  count?: number;
  active?: boolean;
  comingSoon?: boolean;
  onClick?: () => void;
}) {
  const cls = `
    group flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all w-full text-left
    ${active
      ? "bg-blue-600 text-white shadow-sm"
      : "text-slate-400 hover:text-slate-100 hover:bg-slate-800"}
  `;

  const content = (
    <>
      {Icon && (
        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-500 group-hover:text-slate-300"}`} />
      )}
      <span className="flex-1 min-w-0 truncate font-medium">{label}</span>
      {comingSoon && (
        <span className="text-[9px] font-bold uppercase tracking-wider bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded shrink-0">
          Soon
        </span>
      )}
      {count !== undefined && !comingSoon && (
        <span className={`text-xs font-semibold shrink-0 min-w-[1.25rem] text-center tabular-nums ${
          active ? "text-blue-200" : "text-slate-500 group-hover:text-slate-400"
        }`}>
          {count}
        </span>
      )}
    </>
  );

  if (onClick) {
    return <button className={cls} onClick={onClick}>{content}</button>;
  }
  if (href) {
    return <Link href={href} className={cls}>{content}</Link>;
  }
  return null;
}

// ─── Dropdown menu item ──────────────────────────────────────────────────────────

function DropdownItem({
  href,
  label,
  icon: Icon,
  external,
}: {
  href: string;
  label: string;
  icon?: (p: { className?: string }) => React.ReactElement;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
    >
      {Icon && <Icon className="w-4 h-4 text-gray-400 shrink-0" />}
      <span className="flex-1">{label}</span>
      {external && <Ic.ExternalLink className="w-3 h-3 text-gray-300" />}
    </a>
  );
}

// ─── The sidebar content (shared between desktop & mobile drawer) ───────────────

function SidebarContent({
  pathname,
  applicationCount,
  practiceName,
  isDemoMode,
  onAddApplication,
  onOpenFeeModal,
  onOpenNoticeModal,
  onClose,
}: {
  pathname: string;
  applicationCount: number;
  practiceName: string;
  isDemoMode: boolean;
  onAddApplication?: () => void;
  onOpenFeeModal?: () => void;
  onOpenNoticeModal?: () => void;
  onClose?: () => void;
}) {
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  function nav(href: string, label: string, Icon?: (p: { className?: string }) => React.ReactElement, count?: number) {
    return (
      <SidebarLink
        href={href}
        label={label}
        icon={Icon}
        count={count}
        active={isActive(href)}
        onClick={onClose ? () => onClose() : undefined}
      />
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Practice header */}
      <div className="px-4 py-4 border-b border-slate-800">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Practice</p>
        <p className="text-sm font-semibold text-white truncate leading-snug">
          {isDemoMode ? "Murphy Architecture" : practiceName || "Your Practice"}
        </p>
        {isDemoMode && (
          <span className="mt-1 inline-block text-[9px] font-bold bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
            Demo
          </span>
        )}
      </div>

      {/* Add application CTA */}
      <div className="px-3 py-3">
        <button
          onClick={() => { onClose?.(); onAddApplication?.(); }}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-colors shadow-sm"
        >
          <Ic.Plus className="w-3.5 h-3.5" />
          Add Application
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-5 overflow-y-auto">
        <SidebarSection title="Pipeline">
          <SidebarLink
            href="/dashboard"
            label="All Applications"
            icon={Ic.Grid}
            count={applicationCount}
            active={isActive("/dashboard")}
            onClick={onClose ? () => onClose() : undefined}
          />
        </SidebarSection>

        <SidebarSection title="Tools">
          {nav("/interpreter", "Document Interpreter", Ic.Document)}
          {nav("/check",       "County Intelligence",  Ic.Map)}
          <SidebarLink
            label="Notice Generator"
            icon={Ic.Newspaper}
            active={false}
            onClick={() => { onClose?.(); onOpenNoticeModal?.(); }}
          />
          <SidebarLink
            label="Fee Calculator"
            icon={Ic.Calculator}
            active={false}
            onClick={() => { onClose?.(); onOpenFeeModal?.(); }}
          />
          <SidebarLink
            label="Newspaper Finder"
            icon={Ic.Newspaper}
            comingSoon
          />
        </SidebarSection>

        <SidebarSection title="Reports">
          <SidebarLink
            label="Activity Log"
            icon={Ic.Clock}
            active={false}
            onClick={() => { onClose?.(); onAddApplication?.(); }}
          />
          <SidebarLink
            label="Conditions Tracker"
            icon={Ic.ListCheck}
            comingSoon
          />
        </SidebarSection>
      </nav>

      {/* Settings at bottom */}
      <div className="px-3 py-3 border-t border-slate-800">
        <SidebarLink
          href="/dashboard"
          label="Settings"
          icon={Ic.Settings}
          active={false}
          onClick={onClose ? () => onClose() : undefined}
        />
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
  const router    = useRouter();
  const { userEmail } = useAuthStatus();

  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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

  const avatarInitial = isDemoMode
    ? "M"
    : userEmail
    ? userEmail[0].toUpperCase()
    : "A";

  const avatarBg = isDemoMode ? "bg-amber-500" : "bg-blue-700";

  const isTopNavActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  // Notification count: urgent deadlines + RFI flags
  const notifCount = urgentCount;

  return (
    <div className="min-h-screen bg-slate-50 text-gray-900 flex flex-col">

      {/* ── Top navigation bar ─────────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 bg-white border-b border-gray-200 flex items-center px-4 gap-3">

        {/* Mobile hamburger */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="Open navigation"
        >
          <Ic.Menu />
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="text-[1.2rem] font-bold text-green-600 tracking-tight shrink-0 mr-2"
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

        {/* Right side: notifications + avatar */}
        <div className="flex items-center gap-2 ml-auto">

          {/* Notifications bell */}
          <button
            className="relative p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label={notifCount > 0 ? `${notifCount} urgent alerts` : "Notifications"}
          >
            <Ic.Bell />
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
              <div
                className={`w-7 h-7 rounded-full ${avatarBg} flex items-center justify-center text-white text-xs font-bold shrink-0`}
              >
                {avatarInitial}
              </div>
              <Ic.ChevronDown
                className={`w-3.5 h-3.5 text-gray-400 transition-transform hidden sm:block ${dropdownOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-[calc(100%+6px)] w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">

                {/* User header */}
                <div className="px-4 py-3.5 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {isDemoMode
                      ? "Murphy Architecture"
                      : practiceName || "Architect"}
                  </p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">
                    {isDemoMode ? "demo@murphy-architecture.ie" : (userEmail ?? "")}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <DropdownItem href="/dashboard"           label="My Applications"        icon={Ic.Grid} />
                  <DropdownItem href="/dashboard"           label="My Profile"              icon={Ic.User} />
                  <DropdownItem href="/dashboard"           label="Account Settings"        icon={Ic.Settings} />
                  <DropdownItem href="/dashboard"           label="Billing & Subscription"  icon={Ic.CreditCard} />
                  <DropdownItem href="/dashboard"           label="Invite a Colleague"      icon={Ic.Users} />
                </div>

                <div className="border-t border-gray-100 py-1">
                  <DropdownItem
                    href="mailto:hello@granted.ie"
                    label="Request Support"
                    icon={Ic.Chat}
                    external
                  />
                  <DropdownItem
                    href="mailto:hello@granted.ie?subject=Feedback"
                    label="Give Feedback"
                    icon={Ic.Star}
                    external
                  />
                </div>

                {/* Sign out */}
                <div className="border-t border-gray-100 py-1">
                  <button
                    onClick={() => { setDropdownOpen(false); handleSignOut(); }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Ic.LogOut className="w-4 h-4 shrink-0" />
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

        {/* ── Desktop sidebar (fixed, full height) ───────────────────────── */}
        <aside className="hidden lg:flex flex-col fixed left-0 top-14 bottom-0 w-60 bg-slate-900 overflow-y-auto z-30">
          <SidebarContent
            pathname={pathname}
            applicationCount={applicationCount}
            practiceName={practiceName}
            isDemoMode={isDemoMode}
            onAddApplication={onAddApplication}
            onOpenFeeModal={onOpenFeeModal}
            onOpenNoticeModal={onOpenNoticeModal}
          />
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <main className="flex-1 lg:ml-60 min-w-0 flex flex-col">

          {/* Breadcrumb */}
          <div className="bg-white border-b border-gray-200 px-4 sm:px-6 h-10 flex items-center">
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
          <footer className="border-t border-gray-200 bg-white px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1">
                <Link href="/privacy" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                  Terms
                </Link>
                <a
                  href="mailto:hello@granted.ie"
                  className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                >
                  Contact Support
                </a>
                <span className="text-xs text-gray-300">Granted v0.1 Beta</span>
              </div>
              <span className="text-xs text-gray-300">© 2026 Granted. All rights reserved.</span>
            </div>
          </footer>

        </main>
      </div>

      {/* ── Mobile sidebar drawer ─────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          {/* Drawer */}
          <div className="relative w-72 max-w-[85vw] bg-slate-900 h-full flex flex-col shadow-2xl">
            {/* Drawer header */}
            <div className="flex items-center justify-between px-4 h-14 border-b border-slate-800 shrink-0">
              <Link
                href="/"
                className="text-lg font-bold text-green-500 tracking-tight"
                onClick={() => setSidebarOpen(false)}
              >
                Granted
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 -mr-2 text-slate-400 hover:text-white transition-colors"
                aria-label="Close navigation"
              >
                <Ic.X />
              </button>
            </div>
            {/* Drawer body */}
            <div className="flex-1 overflow-y-auto">
              <SidebarContent
                pathname={pathname}
                applicationCount={applicationCount}
                practiceName={practiceName}
                isDemoMode={isDemoMode}
                onAddApplication={onAddApplication}
                onOpenFeeModal={onOpenFeeModal}
                onOpenNoticeModal={onOpenNoticeModal}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
