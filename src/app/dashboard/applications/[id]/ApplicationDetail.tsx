"use client";

import { useState } from "react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface App {
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

// ── Stage config ──────────────────────────────────────────────────────────────

const STAGES = [
  { key: "received",         label: "Received"        },
  { key: "validated",        label: "Validated"       },
  { key: "under_assessment", label: "Under Assessment"},
  { key: "further_info",     label: "Further Info"    },
  { key: "fi_response",      label: "FI Response"     },
  { key: "decision_made",    label: "Decision Made"   },
  { key: "granted",          label: "Granted"         },
  { key: "refused",          label: "Refused / Appeal"},
];

const STATUS_COLOR: Record<string, string> = {
  received: "bg-slate-100 text-slate-700", validated: "bg-blue-100 text-blue-700",
  under_assessment: "bg-indigo-100 text-indigo-700", further_info: "bg-amber-100 text-amber-700",
  fi_response: "bg-yellow-100 text-yellow-700", decision_made: "bg-purple-100 text-purple-700",
  appeal: "bg-orange-100 text-orange-700", granted: "bg-emerald-100 text-emerald-700",
  refused: "bg-red-100 text-red-700",
};

function currentStageIndex(status: string): number {
  const idx = STAGES.findIndex(s => s.key === status);
  return idx >= 0 ? idx : 0;
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IE", { day: "numeric", month: "long", year: "numeric" });
}

function daysUntil(d: string) {
  const today = new Date(); today.setHours(0,0,0,0);
  const t = new Date(d); t.setHours(0,0,0,0);
  return Math.round((t.getTime() - today.getTime()) / 86400000);
}

// ── Component ─────────────────────────────────────────────────────────────────

export function ApplicationDetail({ app: raw }: { app: Record<string, unknown> }) {
  const app = raw as unknown as App;
  const [activeTab, setActiveTab] = useState<"overview" | "notes" | "client" | "activity">("overview");
  const stageIdx = currentStageIndex(app.status);
  const du = daysUntil(app.deadline_date);

  const tabs: Array<{ key: typeof activeTab; label: string }> = [
    { key: "overview",  label: "Overview"     },
    { key: "notes",     label: "Notes"        },
    { key: "client",    label: "Client"       },
    { key: "activity",  label: "Activity Log" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <Link href="/dashboard" className="text-gray-400 hover:text-gray-700">Dashboard</Link>
        <span className="text-gray-300">/</span>
        <Link href="/dashboard/applications" className="text-gray-400 hover:text-gray-700">Applications</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-700 font-medium">{app.reference}</span>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{app.reference}</h1>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLOR[app.status] ?? "bg-gray-100 text-gray-600"}`}>
                {app.status.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}
              </span>
            </div>
            <p className="text-gray-600">{app.client_name}</p>
            <p className="text-sm text-gray-500 mt-0.5">{app.address}</p>
            {app.council && <p className="text-xs text-gray-400 mt-1">{app.council}</p>}
          </div>

          <div className="flex flex-col gap-1.5 text-sm text-right shrink-0">
            <div>
              <span className="text-xs text-gray-400 block">Submitted</span>
              <span className="font-medium text-gray-700">{fmt(app.submission_date)}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 block">Statutory Deadline</span>
              <span className={`font-semibold ${du < 0 ? "text-gray-400" : du <= 7 ? "text-red-600" : du <= 30 ? "text-amber-600" : "text-gray-700"}`}>
                {fmt(app.deadline_date)}{du >= 0 ? ` (${du}d)` : " (passed)"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 8-Stage Timeline */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">Application Progress</h2>

        <div className="relative">
          {/* Connector line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
          <div
            className="absolute top-4 left-4 h-0.5 bg-blue-600 transition-all"
            style={{ width: stageIdx === 0 ? "0%" : `${(stageIdx / (STAGES.length - 1)) * 100}%` }}
          />

          {/* Stage nodes */}
          <div className="relative flex justify-between">
            {STAGES.map((stage, i) => {
              const done    = i < stageIdx;
              const current = i === stageIdx;
              return (
                <div key={stage.key} className="flex flex-col items-center gap-2" style={{ width: `${100 / STAGES.length}%` }}>
                  <div className={[
                    "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all z-10 bg-white",
                    done    ? "border-blue-600 bg-blue-600" :
                    current ? "border-blue-600 ring-4 ring-blue-100" :
                              "border-gray-300",
                  ].join(" ")}>
                    {done ? (
                      <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    ) : (
                      <div className={`w-2 h-2 rounded-full ${current ? "bg-blue-600" : "bg-gray-300"}`} />
                    )}
                  </div>
                  <span className={`text-[10px] text-center leading-tight font-medium ${current ? "text-blue-700" : done ? "text-gray-600" : "text-gray-400"}`}>
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={[
                "px-5 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.key
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-gray-500 hover:text-gray-800",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "overview" && (
            <div className="space-y-4">
              {[
                { label: "Reference",        value: app.reference             },
                { label: "Client",           value: app.client_name           },
                { label: "Property Address", value: app.address               },
                { label: "Planning Authority",value: app.council ?? "—"       },
                { label: "Status",           value: app.status.replace(/_/g," ").replace(/\b\w/g, c=>c.toUpperCase()) },
                { label: "Submitted",        value: fmt(app.submission_date)  },
                { label: "Deadline",         value: fmt(app.deadline_date)    },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-start justify-between py-2 border-b border-gray-50 last:border-0">
                  <span className="text-sm font-medium text-gray-500 w-40 shrink-0">{label}</span>
                  <span className="text-sm text-gray-900 text-right">{value}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "notes" && (
            <div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap min-h-[100px]">
                {app.notes || <span className="text-gray-400 italic">No notes yet.</span>}
              </p>
            </div>
          )}

          {activeTab === "client" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-sm font-medium text-gray-500">Name</span>
                <span className="text-sm text-gray-900">{app.client_name}</span>
              </div>
              <p className="text-sm text-gray-400 italic">
                Additional client contact details can be added when editing the application.
              </p>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="text-sm text-gray-400 italic">
              Activity log coming soon — will show all status changes, document uploads, and notes.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
