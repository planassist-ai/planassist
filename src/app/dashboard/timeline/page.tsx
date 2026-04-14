"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/app/components/DashboardShell";

interface Application {
  id: string;
  referenceNumber: string;
  clientName: string;
  propertyAddress: string;
  council?: string;
  status: string;
  submissionDate: string;
  statutoryDeadline: string;
}

const STAGES = [
  { key: "received",         label: "Received",        shortLabel: "Received",      days: 0  },
  { key: "validated",        label: "Validated",        shortLabel: "Validated",     days: 14 },
  { key: "under_assessment", label: "Under Assessment", shortLabel: "Assessment",    days: 21 },
  { key: "further_info",     label: "Further Info",     shortLabel: "FI Requested",  days: 35 },
  { key: "fi_response",      label: "FI Response",      shortLabel: "FI Response",   days: 42 },
  { key: "decision_made",    label: "Decision Made",    shortLabel: "Decision",      days: 56 },
  { key: "appeal",           label: "Appeal",           shortLabel: "Appeal",        days: 70 },
];

const STAGE_COLORS: Record<string, string> = {
  received:         "bg-gray-400",
  validated:        "bg-gray-500",
  under_assessment: "bg-blue-500",
  further_info:     "bg-red-500",
  fi_response:      "bg-blue-400",
  decision_made:    "bg-green-500",
  appeal:           "bg-orange-500",
  // legacy
  validation:       "bg-gray-500",
  on_display:       "bg-blue-400",
  decision_pending: "bg-amber-500",
  granted:          "bg-green-500",
  refused:          "bg-red-500",
};

function getStageIndex(status: string): number {
  const map: Record<string, number> = {
    received: 0, validation: 0,
    validated: 1,
    under_assessment: 2, on_display: 2,
    further_info: 3,
    fi_response: 4,
    decision_made: 5, decision_pending: 5, granted: 5, refused: 5,
    appeal: 6,
  };
  return map[status] ?? 0;
}

function daysBetween(a: string | Date, b: string | Date) {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86_400_000);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IE", { day: "numeric", month: "short", year: "numeric" });
}

function predictedDecisionDate(submissionDate: string): string {
  const d = new Date(submissionDate);
  d.setDate(d.getDate() + 60); // typical 56-day statutory + 4 day buffer
  return d.toISOString().split("T")[0];
}

function ApplicationTimeline({ app }: { app: Application }) {
  const currentStageIndex = getStageIndex(app.status);
  const daysSinceSubmission = daysBetween(app.submissionDate, new Date());
  const predicted = predictedDecisionDate(app.submissionDate);
  const daysToDecision = daysBetween(new Date(), predicted);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-mono text-gray-400 mb-0.5">{app.referenceNumber}</p>
            <h3 className="text-base font-semibold text-gray-900 truncate">{app.clientName}</h3>
            <p className="text-xs text-gray-500 truncate">{app.propertyAddress}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-xs text-gray-500">Submitted</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(app.submissionDate)}</p>
            <p className="text-xs text-gray-400 mt-0.5">{daysSinceSubmission}d ago</p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="px-5 py-5 overflow-x-auto">
        <div className="min-w-[600px]">
          {/* Stage labels */}
          <div className="flex items-end mb-3" style={{ gap: 0 }}>
            {STAGES.map((stage, i) => (
              <div key={stage.key} className="flex-1 text-center px-1">
                <span className={`text-[10px] font-medium leading-tight block ${
                  i === currentStageIndex
                    ? "text-blue-700 font-bold"
                    : i < currentStageIndex
                    ? "text-gray-500"
                    : "text-gray-300"
                }`}>
                  {stage.shortLabel}
                </span>
              </div>
            ))}
          </div>

          {/* Progress track */}
          <div className="flex items-center gap-0 mb-3">
            {STAGES.map((stage, i) => {
              const isPast = i < currentStageIndex;
              const isCurrent = i === currentStageIndex;
              const color = isCurrent ? (STAGE_COLORS[app.status] ?? "bg-blue-500") : isPast ? "bg-blue-300" : "bg-gray-200";

              return (
                <div key={stage.key} className="flex-1 flex items-center">
                  {/* Connector line before */}
                  {i > 0 && (
                    <div className={`h-1 flex-1 ${isPast || isCurrent ? "bg-blue-300" : "bg-gray-200"}`} />
                  )}
                  {/* Node */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${color} ${isCurrent ? "ring-4 ring-blue-100" : ""}`}>
                    {(isPast) ? (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : isCurrent ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-white" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-gray-300" />
                    )}
                  </div>
                  {/* Connector line after (not on last) */}
                  {i < STAGES.length - 1 && (
                    <div className={`h-1 flex-1 ${isPast ? "bg-blue-300" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Day markers */}
          <div className="flex items-start" style={{ gap: 0 }}>
            {STAGES.map((stage, i) => (
              <div key={stage.key} className="flex-1 text-center px-1">
                <span className={`text-[9px] font-mono ${i <= currentStageIndex ? "text-blue-500" : "text-gray-300"}`}>
                  Day {stage.days}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Prediction footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500">
          <span>
            <span className="font-medium text-gray-700">Stage:</span>{" "}
            {STAGES.find(s => s.key === app.status)?.label ?? app.status.replace(/_/g, " ")}
          </span>
          <span>
            <span className="font-medium text-gray-700">Deadline:</span>{" "}
            {formatDate(app.statutoryDeadline)}
          </span>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Predicted decision</p>
          <p className="text-sm font-semibold text-blue-700">{formatDate(predicted)}</p>
          <p className="text-xs text-gray-400">
            {daysToDecision > 0 ? `in ${daysToDecision} days` : daysToDecision === 0 ? "today" : `${Math.abs(daysToDecision)}d overdue`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function TimelinePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/planning-applications");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        setApplications(Array.isArray(data.applications) ? data.applications : []);
      } catch {
        setError("Could not load applications. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Show only active (non-decided) applications at top, then decided ones
  const active = applications.filter(a => !["decision_made", "granted", "refused"].includes(a.status));
  const decided = applications.filter(a => ["decision_made", "granted", "refused"].includes(a.status));
  const sorted = [...active, ...decided];

  return (
    <DashboardShell breadcrumb={[{ label: "Application Timeline View" }]}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Application Timeline</h1>
          <p className="text-sm text-gray-500 mt-1">
            Visual timeline of the 8 planning stages with days elapsed and predicted decision dates.
          </p>
        </div>

        {loading && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                <div className="h-4 w-48 bg-gray-200 rounded mb-3" />
                <div className="h-3 w-32 bg-gray-100 rounded mb-6" />
                <div className="h-6 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && sorted.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No applications yet</h3>
            <p className="text-sm text-gray-500">Add your first application from the dashboard to see its timeline here.</p>
          </div>
        )}

        {!loading && !error && sorted.length > 0 && (
          <div className="space-y-5">
            {sorted.map(app => (
              <ApplicationTimeline key={app.id} app={app} />
            ))}
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
