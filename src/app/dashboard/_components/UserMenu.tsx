"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  User, Settings, CreditCard, UserPlus,
  MessageSquare, Star, LogOut, ChevronDown,
} from "lucide-react";

export function UserMenu({
  email,
  practiceName,
}: {
  email: string;
  practiceName: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  const initial = email ? email[0].toUpperCase() : "A";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors"
        aria-expanded={open}
      >
        <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
          {initial}
        </div>
        <ChevronDown
          className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`}
          strokeWidth={2.5}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+6px)] w-64 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* Identity */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {practiceName}
            </p>
            <p className="text-xs text-gray-500 truncate mt-0.5">{email}</p>
          </div>

          {/* Primary links */}
          <div className="py-1">
            {[
              { href: "/dashboard/profile",  label: "My Profile",       icon: User       },
              { href: "/dashboard/settings", label: "Account Settings", icon: Settings   },
              { href: "/dashboard/billing",  label: "Billing",          icon: CreditCard },
              { href: "/dashboard/invite",   label: "Invite a Colleague", icon: UserPlus },
            ].map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.75} />
                {label}
              </Link>
            ))}
          </div>

          {/* Support links */}
          <div className="py-1 border-t border-gray-100">
            {[
              { href: "mailto:hello@granted.ie",                  label: "Request Support", icon: MessageSquare },
              { href: "mailto:hello@granted.ie?subject=Feedback", label: "Give Feedback",   icon: Star          },
            ].map(({ href, label, icon: Icon }) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Icon className="w-4 h-4 text-gray-400 shrink-0" strokeWidth={1.75} />
                {label}
              </a>
            ))}
          </div>

          {/* Logout */}
          <div className="py-1 border-t border-gray-100">
            <a
              href="/api/auth/signout"
              className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" strokeWidth={1.75} />
              Log Out
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
