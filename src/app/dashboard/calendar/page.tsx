"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Application {
  id: string;
  reference: string;
  client_name: string;
  address: string;
  deadline_date: string;
  status: string;
}

const DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function urgencyClass(deadline: string): string {
  const today = new Date(); today.setHours(0,0,0,0);
  const d = new Date(deadline); d.setHours(0,0,0,0);
  const days = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (days < 0)   return "bg-gray-100 text-gray-500 border-gray-200";
  if (days <= 7)  return "bg-red-100 text-red-700 border-red-200";
  if (days <= 30) return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

export default function CalendarPage() {
  const [apps, setApps] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("applications")
        .select("id,reference,client_name,address,deadline_date,status")
        .eq("user_id", user.id);
      setApps((data ?? []) as Application[]);
      setLoading(false);
    }
    load();
  }, []);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }

  // Build calendar grid (Mon-Sun, 6 rows max)
  const firstDay = new Date(year, month, 1);
  // Monday-based: 0=Mon, 6=Sun
  const startOffset = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function deadlinesOnDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return apps.filter(a => a.deadline_date === dateStr);
  }

  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Deadline Calendar</h1>
        <div className="flex items-center gap-4">
          {/* Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs">
            {[
              { label: "≤ 7 days",  cls: "bg-red-100 border-red-200 text-red-700" },
              { label: "≤ 30 days", cls: "bg-amber-100 border-amber-200 text-amber-700" },
              { label: "> 30 days", cls: "bg-emerald-100 border-emerald-200 text-emerald-700" },
            ].map(({ label, cls }) => (
              <span key={label} className={`px-2 py-0.5 rounded border text-xs font-medium ${cls}`}>{label}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <button onClick={prevMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
          <h2 className="text-base font-semibold text-gray-900">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAYS.map(d => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-gray-400 uppercase tracking-wide">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 border-l border-gray-100">
          {cells.map((day, i) => {
            const deadlines = day ? deadlinesOnDay(day) : [];
            return (
              <div
                key={i}
                className={`min-h-[90px] border-b border-r border-gray-100 p-1.5 ${day ? "bg-white" : "bg-gray-50"}`}
              >
                {day && (
                  <>
                    <span className={`inline-flex w-6 h-6 items-center justify-center rounded-full text-xs font-medium mb-1 ${
                      isToday(day) ? "bg-blue-700 text-white" : "text-gray-600"
                    }`}>
                      {day}
                    </span>
                    <div className="space-y-0.5">
                      {deadlines.map(app => (
                        <Link
                          key={app.id}
                          href={`/dashboard/applications/${app.id}`}
                          className={`block px-1.5 py-0.5 rounded text-[10px] leading-snug border truncate ${urgencyClass(app.deadline_date)}`}
                          title={`${app.reference} — ${app.client_name}`}
                        >
                          {app.reference}
                        </Link>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming deadlines list */}
      {apps.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3.5 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Upcoming Deadlines</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {apps
              .filter(a => {
                const d = new Date(a.deadline_date); d.setHours(0,0,0,0);
                const t = new Date(); t.setHours(0,0,0,0);
                return d >= t;
              })
              .sort((a, b) => a.deadline_date.localeCompare(b.deadline_date))
              .slice(0, 8)
              .map(app => {
                const du = Math.round((new Date(app.deadline_date).setHours(0,0,0,0) - new Date().setHours(0,0,0,0)) / 86400000);
                return (
                  <div key={app.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <Link href={`/dashboard/applications/${app.id}`} className="text-sm font-medium text-blue-700 hover:underline">
                        {app.reference}
                      </Link>
                      <p className="text-xs text-gray-500">{app.client_name} — {app.address}</p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${urgencyClass(app.deadline_date)}`}>
                        {du === 0 ? "Today" : `${du} day${du !== 1 ? "s" : ""}`}
                      </span>
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
