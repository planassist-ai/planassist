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

interface DeadlineEvent {
  id: string;
  appId: string;
  referenceNumber: string;
  clientName: string;
  council: string;
  type: "statutory_deadline" | "fi_response_deadline" | "appeal_window" | "decision_expected";
  date: string; // YYYY-MM-DD
  label: string;
  urgency: "red" | "amber" | "green";
}

function addDays(d: string, n: number): string {
  const dt = new Date(d);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().split("T")[0];
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function daysUntil(d: string): number {
  return Math.round((new Date(d).getTime() - new Date(today()).getTime()) / 86_400_000);
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IE", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function formatShortDate(d: string) {
  return new Date(d).toLocaleDateString("en-IE", { day: "numeric", month: "short" });
}

function buildEvents(apps: Application[]): DeadlineEvent[] {
  const events: DeadlineEvent[] = [];

  for (const app of apps) {
    // Skip fully decided apps
    if (["decision_made", "granted", "refused"].includes(app.status)) continue;

    // Statutory 56-day deadline
    const deadlineDays = daysUntil(app.statutoryDeadline);
    events.push({
      id: `${app.id}_deadline`,
      appId: app.id,
      referenceNumber: app.referenceNumber,
      clientName: app.clientName,
      council: app.council ?? "Unknown Council",
      type: "statutory_deadline",
      date: app.statutoryDeadline,
      label: "Statutory deadline",
      urgency: deadlineDays <= 7 ? "red" : deadlineDays <= 30 ? "amber" : "green",
    });

    // If in FI stage — add FI response window (4 weeks from submission of FI = estimated)
    if (app.status === "further_info") {
      const fiDeadline = addDays(today(), 28); // 4 weeks from today as estimate
      const fiDays = daysUntil(fiDeadline);
      events.push({
        id: `${app.id}_fi`,
        appId: app.id,
        referenceNumber: app.referenceNumber,
        clientName: app.clientName,
        council: app.council ?? "Unknown Council",
        type: "fi_response_deadline",
        date: fiDeadline,
        label: "FI response window",
        urgency: fiDays <= 7 ? "red" : fiDays <= 30 ? "amber" : "green",
      });
    }

    // Decision expected (predicted at submission + 60 days)
    const predicted = addDays(app.submissionDate, 60);
    if (daysUntil(predicted) >= 0) {
      const predDays = daysUntil(predicted);
      events.push({
        id: `${app.id}_predicted`,
        appId: app.id,
        referenceNumber: app.referenceNumber,
        clientName: app.clientName,
        council: app.council ?? "Unknown Council",
        type: "decision_expected",
        date: predicted,
        label: "Decision expected",
        urgency: predDays <= 7 ? "red" : predDays <= 30 ? "amber" : "green",
      });
    }

    // If appealed — appeal decision window (ABP target: 18 weeks from appeal)
    if (app.status === "appeal") {
      const appealDecision = addDays(app.statutoryDeadline, 126); // 18 weeks after decision date
      const appealDays = daysUntil(appealDecision);
      if (appealDays >= 0) {
        events.push({
          id: `${app.id}_appeal`,
          appId: app.id,
          referenceNumber: app.referenceNumber,
          clientName: app.clientName,
          council: "An Bord Pleanála",
          type: "appeal_window",
          date: appealDecision,
          label: "ABP decision target",
          urgency: appealDays <= 7 ? "red" : appealDays <= 30 ? "amber" : "green",
        });
      }
    }
  }

  // Sort by date
  return events.sort((a, b) => a.date.localeCompare(b.date));
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  statutory_deadline:   "Statutory Deadline",
  fi_response_deadline: "FI Response Window",
  appeal_window:        "ABP Decision Target",
  decision_expected:    "Decision Expected",
};

const URGENCY_CONFIG = {
  red:   { dot: "bg-red-500",   badge: "bg-red-100 text-red-700 border-red-200",   label: "This week",   headerBg: "bg-red-50 border-red-200" },
  amber: { dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700 border-amber-200", label: "This month", headerBg: "bg-amber-50 border-amber-200" },
  green: { dot: "bg-green-500", badge: "bg-green-100 text-green-700 border-green-200", label: "Later",      headerBg: "bg-green-50 border-green-200" },
};

export default function CalendarPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "grouped">("list");
  const [filterUrgency, setFilterUrgency] = useState<"all" | "red" | "amber" | "green">("all");

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

  const events = buildEvents(applications);
  const filteredEvents = filterUrgency === "all" ? events : events.filter(e => e.urgency === filterUrgency);

  const redEvents   = events.filter(e => e.urgency === "red");
  const amberEvents = events.filter(e => e.urgency === "amber");
  const greenEvents = events.filter(e => e.urgency === "green");

  return (
    <DashboardShell breadcrumb={[{ label: "County Deadline Calendar" }]}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Deadline Calendar</h1>
          <p className="text-sm text-gray-500 mt-1">
            All upcoming deadlines across your live applications — colour-coded by urgency.
          </p>
        </div>

        {/* Summary cards */}
        {!loading && !error && events.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {([["red", redEvents.length, "This week"], ["amber", amberEvents.length, "This month"], ["green", greenEvents.length, "Later"]] as const).map(
              ([urgency, count, label]) => (
                <button
                  key={urgency}
                  onClick={() => setFilterUrgency(filterUrgency === urgency ? "all" : urgency)}
                  className={`text-left p-4 rounded-2xl border transition-all ${
                    filterUrgency === urgency
                      ? URGENCY_CONFIG[urgency].headerBg + " ring-2 ring-offset-0"
                      : "bg-white border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${URGENCY_CONFIG[urgency].dot}`} />
                    <span className="text-xs font-medium text-gray-500">{label}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <p className="text-xs text-gray-500">deadline{count !== 1 ? "s" : ""}</p>
                </button>
              )
            )}
          </div>
        )}

        {/* Filter + view controls */}
        {!loading && !error && events.length > 0 && (
          <div className="flex items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-2">
              {filterUrgency !== "all" && (
                <button
                  onClick={() => setFilterUrgency("all")}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Show all
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setView("list")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "list" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                List
              </button>
              <button
                onClick={() => setView("grouped")}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${view === "grouped" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
              >
                By urgency
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse flex gap-4">
                <div className="w-2 h-full rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-gray-200 rounded" />
                  <div className="h-3 w-32 bg-gray-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && events.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1">No upcoming deadlines</h3>
            <p className="text-sm text-gray-500">Add applications to your dashboard to see their deadlines here.</p>
          </div>
        )}

        {/* List view */}
        {!loading && !error && view === "list" && filteredEvents.length > 0 && (
          <div className="space-y-3">
            {filteredEvents.map(event => {
              const days = daysUntil(event.date);
              const u = URGENCY_CONFIG[event.urgency];
              return (
                <div key={event.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden flex">
                  <div className={`w-1 shrink-0 ${u.dot}`} />
                  <div className="flex-1 p-4 flex items-center justify-between gap-4 flex-wrap">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${u.badge}`}>
                          {EVENT_TYPE_LABELS[event.type]}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{event.referenceNumber}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{event.clientName}</p>
                      <p className="text-xs text-gray-500 truncate">{event.council}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold text-gray-900">{formatShortDate(event.date)}</p>
                      <p className={`text-xs font-medium ${
                        days <= 0 ? "text-red-600" : days <= 7 ? "text-red-500" : days <= 30 ? "text-amber-600" : "text-green-600"
                      }`}>
                        {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `${days}d away`}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Grouped view */}
        {!loading && !error && view === "grouped" && (
          <div className="space-y-6">
            {(["red", "amber", "green"] as const).map(urgency => {
              const items = events.filter(e => e.urgency === urgency && (filterUrgency === "all" || filterUrgency === urgency));
              if (items.length === 0) return null;
              const u = URGENCY_CONFIG[urgency];
              return (
                <div key={urgency} className={`rounded-2xl border overflow-hidden ${u.headerBg}`}>
                  <div className={`px-5 py-3 border-b flex items-center gap-2 ${u.headerBg}`}>
                    <span className={`w-2.5 h-2.5 rounded-full ${u.dot}`} />
                    <h3 className="text-sm font-semibold text-gray-900">{u.label} — {items.length} deadline{items.length !== 1 ? "s" : ""}</h3>
                  </div>
                  <div className="bg-white divide-y divide-gray-100">
                    {items.map(event => {
                      const days = daysUntil(event.date);
                      return (
                        <div key={event.id} className="px-5 py-3.5 flex items-center justify-between gap-4 flex-wrap">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${u.badge}`}>
                                {EVENT_TYPE_LABELS[event.type]}
                              </span>
                              <span className="text-xs text-gray-400 font-mono">{event.referenceNumber}</span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">{event.clientName}</p>
                            <p className="text-xs text-gray-400">{event.council}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-gray-900">{formatDate(event.date)}</p>
                            <p className={`text-xs font-medium ${
                              days <= 0 ? "text-red-600" : days <= 7 ? "text-red-500" : days <= 30 ? "text-amber-600" : "text-green-600"
                            }`}>
                              {days < 0 ? `${Math.abs(days)}d overdue` : days === 0 ? "Today" : `in ${days} days`}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </DashboardShell>
  );
}
