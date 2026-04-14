import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

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
  notes: string | null;
  last_updated: string | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  received:         "Received",
  validated:        "Validated",
  under_assessment: "Under Assessment",
  further_info:     "Further Info Requested",
  fi_response:      "FI Response Submitted",
  decision_made:    "Decision Made",
  appeal:           "Appeal",
  granted:          "Granted",
  refused:          "Refused",
};

const STATUS_COLOURS: Record<string, string> = {
  received:         "bg-gray-100 text-gray-700",
  validated:        "bg-blue-100 text-blue-700",
  under_assessment: "bg-blue-100 text-blue-700",
  further_info:     "bg-amber-100 text-amber-700",
  fi_response:      "bg-amber-100 text-amber-700",
  decision_made:    "bg-purple-100 text-purple-700",
  appeal:           "bg-orange-100 text-orange-700",
  granted:          "bg-green-100 text-green-700",
  refused:          "bg-red-100 text-red-700",
};

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

function fmtDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IE", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Layout already guards auth — this is belt-and-braces
  if (!user) return null;

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

  const { data: rows, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("last_updated", { ascending: false });

  const applications: Application[] = (rows ?? []) as Application[];

  // ── Summary stats ──────────────────────────────────────────────────────────
  const total = applications.length;

  const deadlinesSoon = applications.filter((a) => {
    const d = daysUntil(a.deadline_date);
    return d >= 0 && d <= 7;
  }).length;

  const rfis = applications.filter(
    (a) => a.status === "further_info"
  ).length;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {practiceName}
        </h1>
        <p className="text-gray-500 mt-1">
          Here is your planning application pipeline.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">Total Applications</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{total}</p>
        </div>
        <div className={`bg-white rounded-xl border p-5 shadow-sm ${deadlinesSoon > 0 ? "border-amber-300" : "border-gray-200"}`}>
          <p className="text-sm text-gray-500 font-medium">Deadlines This Week</p>
          <p className={`text-3xl font-bold mt-1 ${deadlinesSoon > 0 ? "text-amber-600" : "text-gray-900"}`}>
            {deadlinesSoon}
          </p>
        </div>
        <div className={`bg-white rounded-xl border p-5 shadow-sm ${rfis > 0 ? "border-red-300" : "border-gray-200"}`}>
          <p className="text-sm text-gray-500 font-medium">RFIs Outstanding</p>
          <p className={`text-3xl font-bold mt-1 ${rfis > 0 ? "text-red-600" : "text-gray-900"}`}>
            {rfis}
          </p>
        </div>
      </div>

      {/* Applications list */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          Could not load applications: {error.message}
        </div>
      )}

      {!error && applications.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 mb-1">No applications yet</h3>
          <p className="text-sm text-gray-500 mb-6">
            Add your first planning application to start tracking your pipeline.
          </p>
          <Link
            href="/dashboard/add"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Application
          </Link>
        </div>
      )}

      {!error && applications.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              All Applications
            </h2>
            <Link
              href="/dashboard/add"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Application
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {applications.map((app) => {
              const days = daysUntil(app.deadline_date);
              const urgency =
                days < 0
                  ? "text-gray-400"
                  : days <= 7
                  ? "text-red-600 font-semibold"
                  : days <= 30
                  ? "text-amber-600"
                  : "text-gray-500";

              return (
                <div
                  key={app.id}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Ref + address */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {app.reference}
                    </p>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {app.client_name} — {app.address}
                    </p>
                  </div>

                  {/* Status badge */}
                  <span
                    className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_COLOURS[app.status] ?? "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {STATUS_LABELS[app.status] ?? app.status}
                  </span>

                  {/* Deadline */}
                  <div className="shrink-0 text-right min-w-[120px]">
                    <p className="text-xs text-gray-400">Deadline</p>
                    <p className={`text-xs mt-0.5 ${urgency}`}>
                      {fmtDate(app.deadline_date)}
                      {days >= 0 && days <= 30 && ` (${days}d)`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
