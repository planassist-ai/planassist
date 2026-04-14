import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

interface Application {
  id: string;
  reference: string;
  client_name: string;
  address: string;
  council: string | null;
  status: string;
  submission_date: string;
  deadline_date: string;
}

const STATUS_LABEL: Record<string, string> = {
  received: "Received", validated: "Validated", under_assessment: "Under Assessment",
  further_info: "Further Info", fi_response: "FI Submitted", decision_made: "Decision Made",
  appeal: "Appeal", granted: "Granted", refused: "Refused",
};
const STATUS_COLOR: Record<string, string> = {
  received: "bg-slate-100 text-slate-700", validated: "bg-blue-100 text-blue-700",
  under_assessment: "bg-indigo-100 text-indigo-700", further_info: "bg-amber-100 text-amber-700",
  fi_response: "bg-yellow-100 text-yellow-700", decision_made: "bg-purple-100 text-purple-700",
  appeal: "bg-orange-100 text-orange-700", granted: "bg-emerald-100 text-emerald-700",
  refused: "bg-red-100 text-red-700",
};

function daysUntil(d: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const t = new Date(d); t.setHours(0,0,0,0);
  return Math.round((t.getTime() - today.getTime()) / 86400000);
}
function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IE", { day:"numeric", month:"short", year:"numeric" });
}

export default async function ApplicationsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: rows, error } = await supabase
    .from("applications")
    .select("id,reference,client_name,address,council,status,submission_date,deadline_date")
    .eq("user_id", user.id)
    .order("deadline_date", { ascending: true });

  const apps = (rows ?? []) as Application[];

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">All Applications</h1>
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
          {error.message}
        </div>
      )}

      {!error && apps.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">No applications yet.</p>
          <Link href="/dashboard/applications/new" className="text-sm font-semibold text-blue-700 hover:text-blue-900">
            Add your first application →
          </Link>
        </div>
      )}

      {!error && apps.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Reference","Client","Address","Council","Status","Deadline",""].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {apps.map((app) => {
                  const du = daysUntil(app.deadline_date);
                  const urgency = du < 0 ? "text-gray-400" : du <= 7 ? "text-red-600 font-semibold" : du <= 30 ? "text-amber-600" : "text-gray-600";
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-blue-700 whitespace-nowrap">
                        <Link href={`/dashboard/applications/${app.id}`} className="hover:underline">{app.reference}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{app.client_name}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate">{app.address}</td>
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{app.council ?? "—"}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[app.status] ?? "bg-gray-100 text-gray-600"}`}>
                          {STATUS_LABEL[app.status] ?? app.status}
                        </span>
                      </td>
                      <td className={`px-4 py-3 whitespace-nowrap text-xs ${urgency}`}>
                        {fmt(app.deadline_date)}{du >= 0 && du <= 30 ? ` (${du}d)` : ""}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/dashboard/applications/${app.id}`} className="text-xs font-medium text-blue-600 hover:text-blue-800">View →</Link>
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
