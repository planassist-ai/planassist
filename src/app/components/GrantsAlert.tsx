import { SEAI_GRANTS, getGrantsForFlow, type GrantFlowType } from "@/lib/grants";

interface GrantsAlertProps {
  flowType: GrantFlowType;
  className?: string;
}

export function GrantsAlert({ flowType, className = "" }: GrantsAlertProps) {
  const grants = getGrantsForFlow(flowType);
  if (grants.length === 0) return null;

  return (
    <div className={`rounded-2xl border border-green-200 bg-green-50 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <div className="w-8 h-8 rounded-xl bg-green-600 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-green-900">SEAI grants may be available for this project</h3>
          <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
            {grants.length} grant{grants.length !== 1 ? "s" : ""} available — apply before any work starts
          </p>
        </div>
      </div>

      {/* Grant list */}
      <div className="px-4 pb-3 space-y-2">
        {grants.map(grant => (
          <a
            key={grant.id}
            href={grant.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 bg-white rounded-xl border border-green-200 px-3.5 py-2.5 hover:border-green-400 hover:shadow-sm transition-all group"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 group-hover:text-green-700 transition-colors">{grant.name}</p>
              <p className="text-xs text-gray-500 mt-0.5 truncate">{grant.works}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-sm font-bold text-green-700 whitespace-nowrap">{grant.amount}</span>
              <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-green-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
              </svg>
            </div>
          </a>
        ))}
      </div>

      {/* Warning + disclaimer */}
      <div className="mx-4 mb-4 rounded-xl bg-amber-50 border border-amber-200 px-3.5 py-2.5">
        <p className="text-xs font-semibold text-amber-800 mb-0.5">Important: apply before work starts</p>
        <p className="text-xs text-amber-700 leading-relaxed">
          SEAI grants must be approved before any works begin. Starting work before receiving a grant approval letter will disqualify your application.
          Grant amounts are subject to change — always verify current amounts at{" "}
          <a href="https://www.seai.ie" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-amber-900 font-medium">seai.ie</a>
          {" "}before applying.
        </p>
      </div>

      {/* Full checker link */}
      <div className="px-4 pb-4">
        <a
          href="/grants"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-900 transition-colors"
        >
          Check all grants you may qualify for
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

// ─── Compact dashboard widget variant ────────────────────────────────────────

export function GrantsDashboardWidget({ className = "" }: { className?: string }) {
  // Show top grants by value for the dashboard
  const topGrants = SEAI_GRANTS.filter(g =>
    ["heat-pump", "external-wall", "solar-pv", "attic-insulation", "ber"].includes(g.id)
  );

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-green-100 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-sm font-semibold text-gray-900">SEAI Grants — 2026</h2>
        </div>
        <a
          href="/grants"
          className="text-xs font-medium text-green-600 hover:text-green-800 transition-colors"
        >
          Full grants checker →
        </a>
      </div>

      <div className="p-4 space-y-2">
        {topGrants.map(grant => (
          <div key={grant.id} className="flex items-center justify-between gap-3 py-1">
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-800 truncate">{grant.name}</p>
              <p className="text-[11px] text-gray-400 truncate">
                {grant.applicableTo
                  .map(t => t === "retrofit" ? "retrofit" : t === "extension" ? "extensions" : t === "appearance" ? "appearance" : t === "new-build" ? "new builds" : t)
                  .join(", ")}
              </p>
            </div>
            <span className="text-xs font-bold text-green-700 whitespace-nowrap shrink-0">{grant.amount}</span>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-3 py-2">
          <p className="text-[11px] text-amber-700 leading-relaxed">
            <span className="font-semibold">Remind clients:</span> SEAI grants must be approved before any works begin. Amounts subject to change — verify at{" "}
            <a href="https://www.seai.ie" target="_blank" rel="noopener noreferrer" className="underline font-medium hover:text-amber-900">seai.ie</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
