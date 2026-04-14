import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "./_components/SidebarNav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  // Auth check — redirect to login if no session.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  // Fetch profile server-side so the header always shows real data.
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, practice_name")
    .eq("id", user.id)
    .maybeSingle();

  const practiceName =
    (profile as { practice_name?: string; full_name?: string } | null)
      ?.practice_name ||
    (profile as { practice_name?: string; full_name?: string } | null)
      ?.full_name ||
    "Your Practice";

  const email = user.email ?? "";

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-slate-900 flex flex-col z-30">
        {/* Logo + practice name */}
        <div className="flex-shrink-0 px-5 py-4 border-b border-slate-800">
          <a href="/" className="text-xl font-bold text-blue-400 tracking-tight">
            Granted
          </a>
          <p className="text-xs text-slate-500 mt-0.5 truncate" title={practiceName}>
            {practiceName}
          </p>
        </div>

        {/* Navigation groups — client component handles active state */}
        <SidebarNav />

        {/* Logout — anchor tag to server-side signout route */}
        <div className="flex-shrink-0 border-t border-slate-800 px-3 py-3">
          <a
            href="/api/auth/signout"
            className="flex items-center gap-2.5 px-2.5 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-md transition-colors w-full"
          >
            <svg
              className="w-4 h-4 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.75}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
              />
            </svg>
            Log Out
          </a>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-20">
          <span className="font-semibold text-gray-900 truncate">{practiceName}</span>
          <div className="ml-auto flex items-center gap-5">
            <span className="text-sm text-gray-500 hidden sm:block truncate max-w-[200px]">
              {email}
            </span>
            <a
              href="/api/auth/signout"
              className="text-sm text-red-500 hover:text-red-700 transition-colors font-medium"
            >
              Log out
            </a>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
