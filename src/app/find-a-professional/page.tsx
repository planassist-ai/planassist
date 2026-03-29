"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import { StarDisplay } from "@/app/components/StarRating";
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
import {
  type Builder,
  type TradeType,
  TRADE_LABELS,
  TRADE_OPTIONS,
  formatProjectSize,
} from "@/lib/builders";

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

      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-[15px] leading-tight truncate">{pro.practice_name}</h3>
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

        {/* Profession + rating row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${profColor}`}>
            {profLabel}
          </span>
          {typeof pro.avg_rating === "number" && pro.avg_rating > 0 && (
            <StarDisplay rating={pro.avg_rating} count={pro.review_count} size="sm" />
          )}
        </div>

        {/* Counties */}
        {pro.counties.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Counties covered</p>
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
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Specialisms</p>
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

        {pro.bio && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{pro.bio}</p>
        )}
      </div>

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

// ─── Builder card ─────────────────────────────────────────────────────────────

function BuilderCard({ builder }: { builder: Builder }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all flex flex-col ${
      builder.is_featured ? "border-green-300 ring-1 ring-green-200" : "border-gray-200"
    }`}>
      {builder.is_featured && (
        <div className="bg-green-600 rounded-t-2xl px-4 py-1.5">
          <p className="text-xs font-semibold text-white">Featured</p>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 text-[15px] leading-tight truncate">{builder.company_name}</h3>
            <p className="text-sm text-gray-500 mt-0.5 truncate">{builder.contact_name}</p>
          </div>
          {builder.is_verified && (
            <span title="Verified listing" className="shrink-0 w-6 h-6 rounded-full bg-green-100 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </span>
          )}
        </div>

        {/* Rating */}
        {typeof builder.avg_rating === "number" && builder.avg_rating > 0 && (
          <StarDisplay rating={builder.avg_rating} count={builder.review_count} size="sm" />
        )}

        {/* Trade badges */}
        {builder.trade_types.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {builder.trade_types.slice(0, 2).map(t => (
              <span key={t} className="text-xs bg-blue-50 text-blue-700 border border-blue-200 font-medium px-2.5 py-0.5 rounded-full">
                {TRADE_LABELS[t as keyof typeof TRADE_LABELS] ?? t}
              </span>
            ))}
            {builder.trade_types.length > 2 && (
              <span className="text-xs text-gray-400 px-1">+{builder.trade_types.length - 2} more</span>
            )}
          </div>
        )}

        {/* Counties */}
        {builder.counties.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">Counties covered</p>
            <div className="flex flex-wrap gap-1">
              {builder.counties.slice(0, 4).map(c => (
                <span key={c} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c}</span>
              ))}
              {builder.counties.length > 4 && (
                <span className="text-xs text-gray-400 px-1">+{builder.counties.length - 4} more</span>
              )}
            </div>
          </div>
        )}

        {/* Project size */}
        {(builder.project_size_min !== null || builder.project_size_max !== null) && (
          <p className="text-xs text-gray-500">
            <span className="font-medium text-gray-600">Project size: </span>
            {formatProjectSize(builder.project_size_min, builder.project_size_max)}
          </p>
        )}

        {/* Compliance badges */}
        {(builder.insurance_confirmed || builder.tax_compliant) && (
          <div className="flex gap-1.5 flex-wrap">
            {builder.insurance_confirmed && (
              <span className="text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                Insured
              </span>
            )}
            {builder.tax_compliant && (
              <span className="text-[10px] font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                Tax compliant
              </span>
            )}
          </div>
        )}

        {builder.bio && (
          <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 flex-1">{builder.bio}</p>
        )}
      </div>

      <div className="px-5 pb-5 flex items-center gap-2 flex-wrap">
        <Link
          href={`/builders/${builder.id}`}
          className="flex-1 text-center text-xs font-semibold py-2 px-3 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-colors"
        >
          View profile
        </Link>
        {builder.website && (
          <a
            href={builder.website.startsWith("http") ? builder.website : `https://${builder.website}`}
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
  const initialTab = (searchParams.get("tab") === "builders" ? "builders" : "professionals") as "professionals" | "builders";

  const [activeTab, setActiveTab] = useState<"professionals" | "builders">(initialTab);

  // Professionals state
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [proLoading, setProLoading]       = useState(true);
  const [county, setCounty]               = useState(searchParams.get("county") ?? "");
  const [profType, setProfType]           = useState<ProfessionType | "">(
    (searchParams.get("type") as ProfessionType) ?? ""
  );
  const [specialism, setSpecialism]       = useState(searchParams.get("specialism") ?? "");

  // Builders state
  const [builders, setBuilders]       = useState<Builder[]>([]);
  const [builderLoading, setBuilderLoading] = useState(true);
  const [builderCounty, setBuilderCounty]   = useState(searchParams.get("county") ?? "");
  const [tradeType, setTradeType]           = useState<TradeType | "">((searchParams.get("trade") as TradeType) ?? "");

  const fetchProfessionals = useCallback(async () => {
    setProLoading(true);
    try {
      const params = new URLSearchParams();
      if (county)     params.set("county",    county);
      if (profType)   params.set("type",      profType);
      if (specialism) params.set("specialism", specialism);
      const res  = await fetch(`/api/professionals?${params}`);
      const data = await res.json() as { professionals: Professional[] };
      setProfessionals(data.professionals ?? []);
    } catch {
      setProfessionals([]);
    } finally {
      setProLoading(false);
    }
  }, [county, profType, specialism]);

  const fetchBuilders = useCallback(async () => {
    setBuilderLoading(true);
    try {
      const params = new URLSearchParams();
      if (builderCounty) params.set("county", builderCounty);
      if (tradeType)     params.set("trade",  tradeType);
      const res  = await fetch(`/api/builders?${params}`);
      const data = await res.json() as { builders: Builder[] };
      setBuilders(data.builders ?? []);
    } catch {
      setBuilders([]);
    } finally {
      setBuilderLoading(false);
    }
  }, [builderCounty, tradeType]);

  useEffect(() => { fetchProfessionals(); }, [fetchProfessionals]);
  useEffect(() => { fetchBuilders(); }, [fetchBuilders]);

  const selectCls = "border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white";

  const proActiveFilters     = [county, profType, specialism].filter(Boolean).length;
  const builderActiveFilters = [builderCounty, tradeType].filter(Boolean).length;

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-1.5">
              Find a Professional
            </h1>
            <p className="text-sm text-gray-500 leading-relaxed">
              Connect with architects, planning consultants, builders and specialists across Ireland.
              All listings are free to browse.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/professionals/join"
              className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              + Professional
            </Link>
            <Link
              href="/builders/join"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
            >
              + Builder
            </Link>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab("professionals")}
            className={`flex-1 text-sm font-medium py-2.5 px-4 rounded-lg transition-colors ${
              activeTab === "professionals" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Planning Professionals
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("builders")}
            className={`flex-1 text-sm font-medium py-2.5 px-4 rounded-lg transition-colors ${
              activeTab === "builders" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Builders & Contractors
          </button>
        </div>

        {/* ── Professionals tab ── */}
        {activeTab === "professionals" && (
          <>
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
                {proActiveFilters > 0 && (
                  <div className="flex items-end">
                    <button type="button" onClick={() => { setCounty(""); setProfType(""); setSpecialism(""); }}
                      className="text-xs font-medium text-gray-500 hover:text-gray-800 underline underline-offset-2 pb-2.5 whitespace-nowrap">
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!proLoading && (
              <p className="text-sm text-gray-500 mb-4">
                {professionals.length === 0 ? "No professionals found"
                  : `${professionals.length} professional${professionals.length !== 1 ? "s" : ""} found`}
                {proActiveFilters > 0 && " matching your filters"}
              </p>
            )}

            {proLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : professionals.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {professionals.map(pro => <ProfessionalCard key={pro.id} pro={pro} />)}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 sm:p-16 text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                  {proActiveFilters > 0 ? "No professionals match these filters" : "No professionals listed yet"}
                </h3>
                <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
                  {proActiveFilters > 0 ? "Try adjusting your filters, or check back soon as new professionals join."
                    : `Be the first professional to list${county ? ` in Co. ${county}` : ""}.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {proActiveFilters > 0 && (
                    <button type="button" onClick={() => { setCounty(""); setProfType(""); setSpecialism(""); }}
                      className="text-sm font-medium border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      Clear filters
                    </button>
                  )}
                  <Link href="/professionals/join"
                    className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors">
                    Add your free listing
                  </Link>
                </div>
              </div>
            )}

            {!proLoading && professionals.length > 0 && (
              <div className="mt-10 rounded-2xl bg-green-50 border border-green-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-green-900 mb-1">Are you a planning professional?</h3>
                  <p className="text-xs text-green-700 leading-relaxed">
                    Add your free listing and get found by homeowners and developers across Ireland.
                  </p>
                </div>
                <Link href="/professionals/join"
                  className="shrink-0 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors">
                  Add free listing
                </Link>
              </div>
            )}
          </>
        )}

        {/* ── Builders tab ── */}
        {activeTab === "builders" && (
          <>
            {/* Filter bar */}
            <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 mb-6 shadow-sm">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">County</label>
                  <select value={builderCounty} onChange={e => setBuilderCounty(e.target.value)} className={`w-full ${selectCls}`}>
                    <option value="">All counties</option>
                    {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">Trade type</label>
                  <select value={tradeType} onChange={e => setTradeType(e.target.value as TradeType | "")} className={`w-full ${selectCls}`}>
                    <option value="">All trade types</option>
                    {TRADE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {builderActiveFilters > 0 && (
                  <div className="flex items-end">
                    <button type="button" onClick={() => { setBuilderCounty(""); setTradeType(""); }}
                      className="text-xs font-medium text-gray-500 hover:text-gray-800 underline underline-offset-2 pb-2.5 whitespace-nowrap">
                      Clear filters
                    </button>
                  </div>
                )}
              </div>
            </div>

            {!builderLoading && (
              <p className="text-sm text-gray-500 mb-4">
                {builders.length === 0 ? "No builders found"
                  : `${builders.length} builder${builders.length !== 1 ? "s" : ""} found`}
                {builderActiveFilters > 0 && " matching your filters"}
              </p>
            )}

            {builderLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : builders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {builders.map(b => <BuilderCard key={b.id} builder={b} />)}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-10 sm:p-16 text-center shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1.5">
                  {builderActiveFilters > 0 ? "No builders match these filters" : "No builders listed yet"}
                </h3>
                <p className="text-sm text-gray-500 mb-5 max-w-xs mx-auto">
                  {builderActiveFilters > 0 ? "Try adjusting your filters, or check back soon as new builders join."
                    : `Be the first builder to list${builderCounty ? ` in Co. ${builderCounty}` : ""}.`}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {builderActiveFilters > 0 && (
                    <button type="button" onClick={() => { setBuilderCounty(""); setTradeType(""); }}
                      className="text-sm font-medium border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                      Clear filters
                    </button>
                  )}
                  <Link href="/builders/join"
                    className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors">
                    Add your free listing
                  </Link>
                </div>
              </div>
            )}

            {!builderLoading && builders.length > 0 && (
              <div className="mt-10 rounded-2xl bg-green-50 border border-green-200 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-green-900 mb-1">Are you a builder or contractor?</h3>
                  <p className="text-xs text-green-700 leading-relaxed">
                    Add your free listing and get found by self-builders and developers across Ireland.
                  </p>
                </div>
                <Link href="/builders/join"
                  className="shrink-0 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors">
                  Add free listing
                </Link>
              </div>
            )}
          </>
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
