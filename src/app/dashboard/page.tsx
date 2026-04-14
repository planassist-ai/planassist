import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Application {
  id: string;
  reference: string;
  client_name: string;
  address: string;
  council: string | null;
  status: string;
  submission_date: string;
  deadline_date: string;
  last_updated: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  received:         "Received",
  validated:        "Validated",
  under_assessment: "Under Assessment",
  further_info:     "Further Info",
  fi_response:      "FI Submitted",
  decision_made:    "Decision Made",
  appeal:           "Appeal",
  granted:          "Granted",
  refused:          "Refused",
};

const STATUS_COLOR: Record<string, string> = {
  received:         "bg-slate-100 text-slate-700",
  validated:        "bg-blue-100 text-blue-700",
  under_assessment: "bg-indigo-100 text-indigo-700",
  further_info:     "bg-amber-100 text-amber-700",
  fi_response:      "bg-yellow-100 text-yellow-700",
  decision_made:    "bg-purple-100 text-purple-700",
  appeal:           "bg-orange-100 text-orange-700",
  granted:          "bg-emerald-100 text-emerald-700",
  refused:          "bg-red-100 text-red-700",
};

function daysUntil(d: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const t = new Date(d); t.setHours(0,0,0,0);
  return Math.round((t.getTime() - today.getTime()) / 86400000);
}

function daysElapsed(d: string) {
  return -daysUntil(d);
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IE", { day:"numeric", month:"short", year:"numeric" });
}

function thisMonth(d: string) {
  const now = new Date();
  const t = new Date(d);
  return t.getFullYear() === now.getFullYear() && t.getMonth() === now.getMonth();
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rawProfile } = await supabase
    .from("profiles")
    .select("full_name, practice_name")
    .eq("id", user.id)
    .maybeSingle();

  const profile = rawProfile as { full_name?: string; practice_name?: string } | null;
  const practiceName = profile?.practice_name || profile?.full_name || "Your Practice";

  const { data: rows, error } = await supabase
    .from("applications")
    .select("id,reference,client_name,address,council,status,submission_date,deadline_date,last_updated")
    .eq("user_id", user.id)
    .order("last_updated", { ascending: false });

  const apps = (rows ?? []) as Application[];

  // Stats
  const total       = apps.length;
  const dueThisWeek = apps.filter(a => { const d = daysUntil(a.deadline_date); return d >= 0 && d <= 7; }).length;
  const rfis        = apps.filter(a => a.status === "further_info").length;
  const decisions   = apps.filter(a => ["decision_made","granted","refused"].includes(a.status) && thisMonth(a.last_updated ?? a.deadline_date)).length;

  if (!error && apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Granted, {practiceName}</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          Start building your planning application pipeline. Add your first application to begin tracking deadlines and status updates.
        </p>
        <Link
          href="/dashboard/applications/new"
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add First Application
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">{practiceName}</p>
        </div>
        <Link
          href="/dashboard/applications/new"
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Application
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: total,       color: "text-gray-900",   border: "border-gray-200"  },
          { label: "Due This Week",       value: dueThisWeek, color: dueThisWeek > 0 ? "text-amber-600" : "text-gray-900", border: dueThisWeek > 0 ? "border-amber-300" : "border-gray-200" },
          { label: "RFIs Outstanding",    value: rfis,        color: rfis > 0 ? "text-red-600" : "text-gray-900",   border: rfis > 0 ? "border-red-300" : "border-gray-200"   },
          { label: "Decisions This Month",value: decisions,   color: "text-gray-900",   border: "border-gray-200"  },
        ].map(({ label, value, color, border }) => (
          <div key={label} className={`bg-white rounded-xl border ${border} p-5 shadow-sm`}>
            <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Failed to load applications: {error.message}
        </div>
      )}

      {/* Applications table */}
      {!error && apps.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Applications</h2>
            <span className="text-xs text-gray-400">{apps.length} total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Reference", "Address", "Council", "Status", "Days Elapsed", "Deadline", "Actions"].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apps.map((app) => {
                  const du = daysUntil(app.deadline_date);
                  const de = daysElapsed(app.submission_date);
                  const urgency = du < 0 ? "text-gray-400" : du <= 7 ? "text-red-600 font-semibold" : du <= 30 ? "text-amber-600" : "text-gray-600";
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-blue-700 whitespace-nowrap">
                        <Link href={`/dashboard/applications/${app.id}`} className="hover:underline">
                          {app.reference}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-[200px] truncate">{app.address}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{app.council ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[app.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABEL[app.status] ?? app.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{de}d</td>
                      <td className={`px-4 py-3 whitespace-nowrap text-xs ${urgency}`}>
                        {fmt(app.deadline_date)}{du >= 0 && du <= 30 ? ` (${du}d)` : ""}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Link
                          href={`/dashboard/applications/${app.id}`}
                          className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          View →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
