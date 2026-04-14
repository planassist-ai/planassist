"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, FileText, Calendar, Activity,
  CheckCircle2, ClipboardList, Calculator, Map, Newspaper,
  FileSearch, BookOpen, Ruler, Shield, MessageSquare, Bell,
  Users, Mail, ExternalLink,
  User, Settings, CreditCard,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Pipeline",
    items: [
      { label: "Dashboard",             href: "/dashboard",                      icon: LayoutDashboard },
      { label: "All Applications",      href: "/dashboard/applications",         icon: FileText        },
      { label: "Deadline Calendar",     href: "/dashboard/calendar",             icon: Calendar        },
      { label: "Application Timeline",  href: "/dashboard/timeline",             icon: Activity        },
    ],
  },
  {
    title: "Planning Tools",
    items: [
      { label: "Permission Checker",    href: "/dashboard/check",                icon: CheckCircle2    },
      { label: "Document Checklist",    href: "/dashboard/checklist",            icon: ClipboardList   },
      { label: "Fee Calculator",        href: "/dashboard/fees",                 icon: Calculator      },
      { label: "County Intelligence",   href: "/dashboard/county-intelligence",  icon: Map             },
      { label: "Newspaper Finder",      href: "/dashboard/newspaper",            icon: Newspaper       },
    ],
  },
  {
    title: "Applications",
    items: [
      { label: "Document Interpreter",  href: "/dashboard/interpreter",          icon: FileSearch      },
      { label: "Planning Statement",    href: "/dashboard/planning-statement",   icon: BookOpen        },
      { label: "Design Guide Checker",  href: "/dashboard/design-check",         icon: Ruler           },
      { label: "Pre-Submission Check",  href: "/dashboard/validator",            icon: Shield          },
      { label: "RFI Assistant",         href: "/dashboard/rfi",                  icon: MessageSquare   },
      { label: "Notice Generator",      href: "/dashboard/notices",              icon: Bell            },
    ],
  },
  {
    title: "Clients",
    items: [
      { label: "Client List",       href: "/dashboard/clients",  icon: Users        },
      { label: "Email Templates",   href: "/dashboard/emails",   icon: Mail         },
      { label: "Client Portal",     href: "/dashboard/portal",   icon: ExternalLink },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "My Profile",  href: "/dashboard/profile",   icon: User       },
      { label: "Settings",    href: "/dashboard/settings",  icon: Settings   },
      { label: "Billing",     href: "/dashboard/billing",   icon: CreditCard },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-700">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-2.5 mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-sm transition-colors",
                    active
                      ? "bg-blue-700 text-white font-medium"
                      : "text-slate-400 hover:text-white hover:bg-slate-800",
                  ].join(" ")}
                >
                  <item.icon
                    className="w-[15px] h-[15px] shrink-0"
                    strokeWidth={active ? 2.5 : 1.75}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}
