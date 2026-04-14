"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_GROUPS = [
  {
    title: "Planning",
    items: [
      { label: "Permission Checker",   href: "/check"               },
      { label: "County Intelligence",  href: "/county-intelligence"  },
      { label: "Document Interpreter", href: "/interpreter"          },
      { label: "SEAI Grants",          href: "/grants"               },
      { label: "Document Checklist",   href: "/checklist"            },
      { label: "Fee Calculator",       href: "/fees"                 },
      { label: "Newspaper Finder",     href: "/newspaper"            },
    ],
  },
  {
    title: "Applications",
    items: [
      { label: "Pipeline Dashboard",    href: "/dashboard"           },
      { label: "Application Timeline",  href: "/dashboard/timeline"  },
      { label: "Deadline Calendar",     href: "/dashboard/calendar"  },
    ],
  },
  {
    title: "Clients",
    items: [
      { label: "Client Portal",    href: "/dashboard/portal" },
      { label: "Email Templates",  href: "/dashboard/emails" },
    ],
  },
  {
    title: "Settings",
    items: [
      { label: "My Profile", href: "/dashboard/profile"  },
      { label: "Settings",   href: "/dashboard/settings" },
      { label: "Billing",    href: "/dashboard/billing"  },
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
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
      {NAV_GROUPS.map((group) => (
        <div key={group.title}>
          <p className="px-2 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            {group.title}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "flex items-center px-2.5 py-1.5 rounded-md text-sm transition-colors",
                  isActive(item.href)
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-400 hover:text-white hover:bg-slate-800",
                ].join(" ")}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );
}
