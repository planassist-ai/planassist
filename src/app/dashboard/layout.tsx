import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SidebarNav } from "./_components/SidebarNav";
import { UserMenu } from "./_components/UserMenu";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("full_name, practice_name")
    .eq("id", user.id)
    .maybeSingle();

  const profile = rawProfile as { full_name?: string; practice_name?: string } | null;
  const practiceName = profile?.practice_name || profile?.full_name || "Your Practice";
  const email = user.email ?? "";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-[#0f172a] flex flex-col z-30">

        {/* Brand */}
        <div className="flex-shrink-0 h-14 flex items-center px-5 border-b border-slate-800">
          <a href="/" className="text-lg font-bold text-blue-400 tracking-tight">
            Granted
          </a>
          <span className="ml-2 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            Pro
          </span>
        </div>

        {/* Navigation */}
        <SidebarNav />

        {/* Logout */}
        <div className="flex-shrink-0 border-t border-slate-800 p-3">
          <a
            href="/api/auth/signout"
            className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors w-full"
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

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <div className="ml-64 flex-1 flex flex-col min-h-0 min-w-0">

        {/* Header */}
        <header className="flex-shrink-0 h-14 bg-white border-b border-gray-200 flex items-center px-6 sticky top-0 z-20">
          <span className="text-sm font-semibold text-gray-900 truncate">
            {practiceName}
          </span>

          <div className="ml-auto flex items-center gap-3">
            {/* Notifications bell */}
            <button
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Notifications"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
              </svg>
            </button>

            {/* User menu */}
            <UserMenu email={email} practiceName={practiceName} />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
