"use client";

import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/app/components/AppShell";
import {
  PROFESSION_OPTIONS,
  SPECIALISM_OPTIONS,
  COUNTIES,
  type ProfessionType,
  type Specialism,
} from "@/lib/professionals";

interface FormState {
  name: string;
  practice_name: string;
  profession_type: ProfessionType | "";
  email: string;
  phone: string;
  website: string;
  bio: string;
  counties: string[];
  specialisms: string[];
}

const EMPTY: FormState = {
  name: "", practice_name: "", profession_type: "",
  email: "", phone: "", website: "", bio: "",
  counties: [], specialisms: [],
};

const inputCls  = "w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white";
const labelCls  = "block text-sm font-medium text-gray-800 mb-1.5";
const hintCls   = "text-xs text-gray-500 mt-0.5 leading-relaxed";

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

function MultiSelect({
  label,
  hint,
  options,
  selected,
  onChange,
}: {
  label: string;
  hint?: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (vals: string[]) => void;
}) {
  function toggle(val: string) {
    onChange(selected.includes(val) ? selected.filter(v => v !== val) : [...selected, val]);
  }
  return (
    <div>
      <label className={labelCls}>{label}</label>
      {hint && <p className={hintCls}>{hint}</p>}
      <div className="flex flex-wrap gap-2 mt-2">
        {options.map(opt => {
          const active = selected.includes(opt.value);
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => toggle(opt.value)}
              className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                active
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-green-400 hover:text-green-700"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ProfessionalsJoinPage() {
  const [form, setForm]       = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.counties.length === 0) {
      setError("Please select at least one county you cover.");
      return;
    }
    if (form.specialisms.length === 0) {
      setError("Please select at least one project specialism.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res  = await fetch("/api/professionals", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        return;
      }
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <AppShell>
        <div className="max-w-lg mx-auto px-4 py-16 sm:px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-5">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Listing submitted</h1>
          <p className="text-sm text-gray-500 leading-relaxed mb-6 max-w-sm mx-auto">
            Thank you — your listing is now live in the Granted directory.
            Check your email for a confirmation. We&apos;ll be in touch if we need any additional details.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/find-a-professional"
              className="text-sm font-semibold bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition-colors"
            >
              View the directory
            </Link>
            <Link
              href="/"
              className="text-sm font-medium border border-gray-200 px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Back to home
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
            Add your free listing
          </h1>
          <p className="text-sm text-gray-500 leading-relaxed">
            Get found by homeowners and developers looking for planning professionals across Ireland.
            Listings are free — no subscription required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Section 1: Personal details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <SectionHeading number="1" title="Your details" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="name" className={labelCls}>Your name <span className="text-red-500">*</span></label>
                <input
                  id="name" type="text" required
                  value={form.name} onChange={e => setField("name", e.target.value)}
                  placeholder="e.g. Aoife Murphy"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="profession_type" className={labelCls}>Profession type <span className="text-red-500">*</span></label>
                <select
                  id="profession_type" required
                  value={form.profession_type}
                  onChange={e => setField("profession_type", e.target.value as ProfessionType)}
                  className={inputCls}
                >
                  <option value="">Select…</option>
                  {PROFESSION_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="email" className={labelCls}>Email address <span className="text-red-500">*</span></label>
                <input
                  id="email" type="email" required
                  value={form.email} onChange={e => setField("email", e.target.value)}
                  placeholder="you@practice.ie"
                  className={inputCls}
                />
                <p className={hintCls}>Used for your profile contact button and confirmation email</p>
              </div>
              <div>
                <label htmlFor="phone" className={labelCls}>Phone number</label>
                <input
                  id="phone" type="tel"
                  value={form.phone} onChange={e => setField("phone", e.target.value)}
                  placeholder="e.g. 01 234 5678"
                  className={inputCls}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Practice */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <SectionHeading number="2" title="Practice details" />
            <div className="space-y-5">
              <div>
                <label htmlFor="practice_name" className={labelCls}>Practice / company name <span className="text-red-500">*</span></label>
                <input
                  id="practice_name" type="text" required
                  value={form.practice_name} onChange={e => setField("practice_name", e.target.value)}
                  placeholder="e.g. Murphy Architects Ltd"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="website" className={labelCls}>Website</label>
                <input
                  id="website" type="url"
                  value={form.website} onChange={e => setField("website", e.target.value)}
                  placeholder="https://www.yourpractice.ie"
                  className={inputCls}
                />
              </div>
              <div>
                <label htmlFor="bio" className={labelCls}>About your practice</label>
                <p className={hintCls}>Briefly describe your practice, experience, and what you specialise in (max 500 characters)</p>
                <textarea
                  id="bio"
                  value={form.bio}
                  onChange={e => setField("bio", e.target.value.slice(0, 500))}
                  rows={4}
                  placeholder="e.g. Murphy Architects is a Galway-based practice with over 15 years' experience in rural new builds and conservation projects across Connaught…"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white resize-y leading-relaxed"
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{form.bio.length}/500</p>
              </div>
            </div>
          </div>

          {/* Section 3: Coverage */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 sm:p-6 shadow-sm">
            <SectionHeading number="3" title="Coverage and specialisms" />
            <div className="space-y-6">
              <MultiSelect
                label="Counties covered *"
                hint="Select all counties where you regularly take on projects"
                options={COUNTIES.map(c => ({ value: c, label: c }))}
                selected={form.counties}
                onChange={vals => setField("counties", vals)}
              />
              <MultiSelect
                label="Project specialisms *"
                hint="Select the project types you specialise in"
                options={SPECIALISM_OPTIONS}
                selected={form.specialisms}
                onChange={vals => setField("specialisms", vals as Specialism[])}
              />
            </div>
          </div>

          {/* Terms note */}
          <p className="text-xs text-gray-500 leading-relaxed">
            By submitting your listing you confirm that the information provided is accurate and that you consent to it being published in the Granted Professional Directory. Listings are free. Granted reserves the right to remove listings that are inaccurate or inappropriate.
          </p>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-2xl text-sm transition-colors flex items-center justify-center gap-2.5"
          >
            {submitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting listing…
              </>
            ) : (
              "Submit free listing"
            )}
          </button>
        </form>

      </div>
    </AppShell>
  );
}
