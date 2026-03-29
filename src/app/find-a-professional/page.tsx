"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import {
  type Professional,
  type ProfessionType,
  PROFESSION_LABELS,
  PROFESSION_COLORS,
  SPECIALISM_LABELS,
  PROFESSION_OPTIONS,
  SPECIALISM_OPTIONS,
  COUNTIES,
} from "@/lib/professionals";

// ─── Professional card ────────────────────────────────────────────────────────

function ProfessionalCard({ pro }: { pro: Professional }) {
  const profColor = PROFESSION_COLORS[pro.profession_type] ?? "bg-gray-100 text-gray-600 border-gray-200";
  const profLabel = PROFESSION_LABELS[pro.profession_type] ?? pro.profession_type;

  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col ${
      pro.is_featured ? "border-green-300 ring-1 ring-green-200" : "border-gray-200"
    }`}>
      {pro.is_featured && (
        <div className="bg-green-600 rounded-t-2xl px-4 py-1.5">
          <p className="text-xs font-semibold text-white">Featured</p>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-[15px] leading-tight truncate">
              {pro.practice_name}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{pro.name}</p>
          </div>
          {pro.is_verified && (
            <span title="Verified listing" className="shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
          )}
        </div>

        {/* Profession badge */}
        <span className={`self-start inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${profColor}`}>
          {profLabel}
        </span>

        {/* Counties */}
        {pro.counties.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Counties covered</p>
            <div className="flex flex-wrap gap-1">
              {pro.counties.slice(0, 4).map(c => (
                <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
              ))}
              {pro.counties.length > 4 && (
                <span className="text-xs text-gray-400 px-1">+{pro.counties.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {/* Specialisms */}
        {pro.specialisms.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Specialisms</p>
            <div className="flex flex-wrap gap-1">
              {pro.specialisms.slice(0, 3).map(s => (
                <span key={s} className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">
                  {SPECIALISM_LABELS[s as keyof typeof SPECIALISM_LABELS] ?? s}
                </span>
              ))}
              {pro.specialisms.length > 3 && (
                <span className="text-xs text-gray-400 px-1">+{pro.specialisms.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Bio snippet */}
        {pro.bio && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{pro.bio}</p>
        )}
      </div>

      {/* Footer actions */}
      <div className="px-5 pb-5 flex items-center gap-2 flex-wrap">
        <Link
          href={`/professionals/${pro.id}`}
          className="flex-1 text-center text-xs font-semibold py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
        >
          View profile
        </Link>
        {pro.website && (
          <a
            href={pro.website.startsWith("http") ? pro.website : `https://${pro.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium py-2 px-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Website
          </a>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
      <div className="h-5 w-40 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-28 bg-gray-100 rounded mb-4" />
      <div className="h-6 w-32 bg-gray-200 rounded-full mb-4" />
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
        <div className="h-5 w-14 bg-gray-100 rounded-full" />
        <div className="h-5 w-20 bg-gray-100 rounded-full" />
      </div>
      <div className="h-8 w-full bg-gray-200 rounded-xl mt-4" />
    </div>
  );
}

// ─── Inner page (uses useSearchParams — must be inside Suspense) ──────────────

function FindAProfessionalInner() {
  const searchParams = useSearchParams();

  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading]             = useState(true);
  const [county, setCounty]               = useState(searchParams.get("county") ?? "");
  const [profType, setProfType]           = useState<ProfessionType | "">(
    (searchParams.get("type") as ProfessionType) ?? ""
  );
  const [specialism, setSpecialism]       = useState(searchParams.get("specialism") ?? "");

  const fetchProfessionals = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (county)    params.set("county",    county);
      if (profType)  params.set("type",      profType);
      if (specialism) params.set("specialism", specialism);
      const res  = await fetch(`/api/professionals?${params}`);
      const data = await res.json() as { professionals: Professional[] };
      setProfessionals(data.professionals ?? []);
    } catch {
      setProfessionals([]);
    } finally {
      setLoading(false);
    }
  }, [county, profType, specialism]);

  useEffect(() => { fetchProfessionals(); }, [fetchProfessionals]);

  const activeFilters = [county, profType, specialism].filter(Boolean).length;

  function clearFilters() {
    setCounty("");
    setProfType("");
    setSpecialism("");
  }

  const selectCls = "border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white";

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1.5">
              Find a Professional
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connect with architects, planning consultants and specialists across Ireland.
              All listings are free to browse.
            </p>
          </div>
          <Link
            href="/professionals/join"
            className="shrink-0 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add free listing
          </Link>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 mb-6 shadow-sm">
          <div className="flex flex-wrap gap-3">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">County</label>
              <select value={county} onChange={e => setCounty(e.target.value)} className={`w-full ${selectCls}`}>
                <option value="">All counties</option>
                {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Profession</label>
              <select value={profType} onChange={e => setProfType(e.target.value as ProfessionType | "")} className={`w-full ${selectCls}`}>
                <option value="">All professions</option>
                {PROFESSION_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Specialism</label>
              <select value={specialism} onChange={e => setSpecialism(e.target.value)} className={`w-full ${selectCls}`}>
                <option value="">All specialisms</option>
                {SPECIALISM_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            {activeFilters > 0 && (
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-gray-500 hover:text-gray-800 underline underline-offset-2 pb-2.5 whitespace-nowrap"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            {professionals.length === 0
              ? "No professionals found"
              : `${professionals.length} professional${professionals.length !== 1 ? "s" : ""} found`}
            {activeFilters > 0 && " matching your filters"}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : professionals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {professionals.map(pro => <ProfessionalCard key={pro.id} pro={pro} />)}
          </div>
        ) : (
          /* Empty state */
          <div className="bg-white rounded-2xl border border-gray-200 p-10 sm:p-16 text-center shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-1.5">
              {activeFilters > 0 ? "No professionals match these filters" : "No professionals listed yet"}
            </h3>
            <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
              {activeFilters > 0
                ? "Try adjusting your filters, or check back soon as new professionals join."
                : `Be the first professional to list${county ? ` in Co. ${county}` : ""}.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {activeFilters > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-sm font-medium border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Clear filters
                </button>
              )}
              <Link
                href="/professionals/join"
                className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors"
              >
                Add your free listing
              </Link>
            </div>
          </div>
        )}

        {/* Bottom CTA for professionals */}
        {!loading && professionals.length > 0 && (
          <div className="mt-10 rounded-2xl bg-green-50 border border-green-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-green-900 mb-1">Are you a planning professional?</h3>
              <p className="text-xs text-green-700 leading-relaxed">
                Add your free listing and get found by homeowners and developers across Ireland.
                No subscription required.
              </p>
            </div>
            <Link
              href="/professionals/join"
              className="shrink-0 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors"
            >
              Add free listing
            </Link>
          </div>
        )}

      </div>
    </AppShell>
  );
}

// ─── Default export wrapped in Suspense (required for useSearchParams) ────────

export default function FindAProfessionalPage() {
  return (
    <Suspense>
      <FindAProfessionalInner />
    </Suspense>
  );
}
