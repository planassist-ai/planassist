"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import {
  TRADE_OPTIONS,
  PROJECT_SIZE_OPTIONS,
  type TradeType,
} from "@/lib/builders";

const COUNTIES = [
  "Carlow","Cavan","Clare","Cork","Donegal","Dublin","Galway","Kerry",
  "Kildare","Kilkenny","Laois","Leitrim","Limerick","Longford","Louth",
  "Mayo","Meath","Monaghan","Offaly","Roscommon","Sligo","Tipperary",
  "Waterford","Westmeath","Wexford","Wicklow",
];

interface FormState {
  company_name: string;
  contact_name: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
  trade_types: TradeType[];
  counties: string[];
  project_size_min: number | "";
  project_size_max: number | "";
  insurance_confirmed: boolean;
  tax_compliant: boolean;
}

const EMPTY: FormState = {
  company_name: "", contact_name: "", email: "", phone: "", website: "", bio: "",
  trade_types: [], counties: [], project_size_min: "", project_size_max: "",
  insurance_confirmed: false, tax_compliant: false,
};

const inputCls = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white";
const labelCls = "block text-sm font-medium text-gray-800 mb-1.5";
const hintCls  = "text-xs text-gray-500 mt-0.5 leading-relaxed";

function SectionHeading({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-7 h-7 rounded-full bg-green-600 flex items-center justify-center shrink-0">
        <span className="text-xs font-bold text-white">{number}</span>
      </div>
      <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
    </div>
  );
}

function PillSelect<T extends string>({
  label, hint, options, selected, onChange,
}: {
  label: string; hint?: string;
  options: { value: T; label: string }[];
  selected: T[]; onChange: (v: T[]) => void;
}) {
  function toggle(val: T) {
    onChange(selected.includes(val) ? selected.filter(x => x !== val) : [...selected, val]);
  }
  return (
    <div>
      <p className={labelCls}>{label}</p>
      {hint && <p className={hintCls}>{hint}</p>}
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(o => (
          <button
            key={o.value}
            type="button"
            onClick={() => toggle(o.value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
              selected.includes(o.value)
                ? "bg-green-600 border-green-600 text-white"
                : "border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 bg-white"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CountySelect({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  function toggle(c: string) {
    onChange(selected.includes(c) ? selected.filter(x => x !== c) : [...selected, c]);
  }
  return (
    <div>
      <p className={labelCls}>Counties Covered <span className="text-red-500">*</span></p>
      <p className={hintCls}>Select all counties you actively take on work in.</p>
      <div className="flex flex-wrap gap-1.5 mt-2">
        {COUNTIES.map(c => (
          <button
            key={c}
            type="button"
            onClick={() => toggle(c)}
            className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
              selected.includes(c)
                ? "bg-green-600 border-green-600 text-white font-medium"
                : "border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 bg-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function BuildersJoinPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [success, setSuccess]       = useState(false);

  function set(field: keyof FormState, value: unknown) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.company_name.trim()) { setError("Company name is required."); return; }
    if (!form.contact_name.trim()) { setError("Contact name is required."); return; }
    if (!form.email.trim()) { setError("Email address is required."); return; }
    if (form.trade_types.length === 0) { setError("Please select at least one trade type."); return; }
    if (form.counties.length === 0) { setError("Please select at least one county."); return; }

    setSubmitting(true);
    try {
      const res = await fetch("/api/builders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company_name:        form.company_name.trim(),
          contact_name:        form.contact_name.trim(),
          email:               form.email.trim(),
          phone:               form.phone.trim() || undefined,
          website:             form.website.trim() || undefined,
          bio:                 form.bio.trim() || undefined,
          trade_types:         form.trade_types,
          counties:            form.counties,
          project_size_min:    form.project_size_min !== "" ? form.project_size_min : undefined,
          project_size_max:    form.project_size_max !== "" ? form.project_size_max : undefined,
          insurance_confirmed: form.insurance_confirmed,
          tax_compliant:       form.tax_compliant,
        }),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok || !data.success) {
        setError(data.error ?? "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Listing submitted!</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            Your listing is now live on the Planr Builders Directory.
            We have sent a confirmation to <strong>{form.email}</strong>.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/find-a-professional"
              className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors"
            >
              View directory
            </Link>
            <Link
              href="/"
              className="text-sm font-medium border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-gray-700"
            >
              Go to home
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-2xl mx-auto px-4 py-8 sm:px-6">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/find-a-professional"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to directory
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-2">
            Add your free builder listing
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Get found by homeowners and self-builders across Ireland. No subscription, no fees — just a free listing.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Company details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-sm">
            <SectionHeading number="1" title="Company Details" />
            <div className="space-y-4">
              <div>
                <label className={labelCls}>Company / Trading Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.company_name}
                  onChange={e => set("company_name", e.target.value)}
                  placeholder="e.g. Murphy Construction Ltd"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Contact Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={form.contact_name}
                  onChange={e => set("contact_name", e.target.value)}
                  placeholder="Primary contact"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => set("email", e.target.value)}
                  placeholder="contact@example.ie"
                  className={inputCls}
                  autoComplete="email"
                />
                <p className={hintCls}>Used for enquiries and confirmation. Not shown publicly.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => set("phone", e.target.value)}
                    placeholder="085 000 0000"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className={labelCls}>Website</label>
                  <input
                    type="text"
                    value={form.website}
                    onChange={e => set("website", e.target.value)}
                    placeholder="www.example.ie"
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className={labelCls}>Company Bio / Description</label>
                <textarea
                  value={form.bio}
                  onChange={e => set("bio", e.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Briefly describe your company, experience and the type of work you specialise in…"
                  className={`${inputCls} resize-none`}
                />
                <p className={hintCls}>{form.bio.length}/1,000 characters</p>
              </div>
            </div>
          </div>

          {/* Section 2: Trade types */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-sm">
            <SectionHeading number="2" title="Trade Types" />
            <PillSelect
              label="What type of work do you carry out? *"
              hint="Select all that apply."
              options={TRADE_OPTIONS}
              selected={form.trade_types}
              onChange={v => set("trade_types", v)}
            />
          </div>

          {/* Section 3: Coverage & project size */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-sm">
            <SectionHeading number="3" title="Coverage & Project Size" />
            <div className="space-y-5">
              <CountySelect selected={form.counties} onChange={v => set("counties", v)} />

              <div>
                <p className={labelCls}>Typical project size range</p>
                <p className={hintCls}>Optional — helps homeowners find the right fit.</p>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Minimum</label>
                    <select
                      value={form.project_size_min}
                      onChange={e => set("project_size_min", e.target.value === "" ? "" : Number(e.target.value))}
                      className={inputCls}
                    >
                      <option value="">No minimum</option>
                      {PROJECT_SIZE_OPTIONS.filter(o => o.value > 0).map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Maximum</label>
                    <select
                      value={form.project_size_max}
                      onChange={e => set("project_size_max", e.target.value === "" ? "" : Number(e.target.value))}
                      className={inputCls}
                    >
                      <option value="">No maximum</option>
                      {PROJECT_SIZE_OPTIONS.filter(o => o.value > 0).map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Compliance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 sm:p-7 shadow-sm">
            <SectionHeading number="4" title="Compliance Declarations" />
            <p className="text-xs text-gray-500 mb-5 leading-relaxed">
              These declarations help homeowners identify compliant contractors. By ticking these you confirm the statements are true.
            </p>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => set("insurance_confirmed", !form.insurance_confirmed)}
                  className={`w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                    form.insurance_confirmed ? "bg-green-600 border-green-600" : "border-gray-300 group-hover:border-green-400"
                  }`}
                >
                  {form.insurance_confirmed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">
                  I confirm that my company holds valid <strong>public liability insurance</strong> of at least €2.6M.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => set("tax_compliant", !form.tax_compliant)}
                  className={`w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors cursor-pointer ${
                    form.tax_compliant ? "bg-green-600 border-green-600" : "border-gray-300 group-hover:border-green-400"
                  }`}
                >
                  {form.tax_compliant && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-700 leading-relaxed">
                  I confirm that my company is <strong>tax compliant</strong> and registered with Revenue.
                </span>
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
          >
            {submitting ? "Submitting…" : "Submit free listing"}
          </button>

          <p className="text-center text-xs text-gray-400 leading-relaxed">
            By submitting you confirm the information provided is accurate. Listings may be removed if found to be inaccurate or misleading.
          </p>
        </form>
      </div>
    </AppShell>
  );
}
