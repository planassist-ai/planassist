"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const IRISH_COUNCILS = [
  "Carlow County Council","Cavan County Council","Clare County Council",
  "Cork City Council","Cork County Council","Donegal County Council",
  "Dublin City Council","Dún Laoghaire-Rathdown County Council","Fingal County Council",
  "Galway City Council","Galway County Council","Kerry County Council",
  "Kildare County Council","Kilkenny County Council","Laois County Council",
  "Leitrim County Council","Limerick City and County Council","Longford County Council",
  "Louth County Council","Mayo County Council","Meath County Council",
  "Monaghan County Council","Offaly County Council","Roscommon County Council",
  "Sligo County Council","South Dublin County Council","Tipperary County Council",
  "Waterford City and County Council","Westmeath County Council",
  "Wexford County Council","Wicklow County Council",
];

const PROJECT_TYPES = [
  "Residential Extension","New Dwelling","Change of Use","Commercial Development",
  "Industrial Development","Protected Structure","One-Off Rural Housing",
  "Social Housing","Retail","Hospitality","Healthcare","Education",
  "Agricultural","Conservation / Restoration","Strategic Housing Development",
  "Large-Scale Residential Development","Other",
];

function addDays(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

export default function NewApplicationPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    reference:      "",
    client_name:    "",
    client_email:   "",
    address:        "",
    council:        "",
    project_type:   "",
    submission_date: new Date().toISOString().split("T")[0],
  });

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.reference.trim() || !form.client_name.trim() || !form.address.trim() || !form.submission_date) {
      setError("Reference, client name, address, and submission date are required.");
      return;
    }

    setSaving(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Not authenticated. Please log in."); return; }

      const deadline = addDays(form.submission_date, 56);

      const { data, error: insertError } = await supabase
        .from("applications")
        .insert({
          reference:       form.reference.trim(),
          client_name:     form.client_name.trim(),
          address:         form.address.trim(),
          council:         form.council || null,
          status:          "received",
          submission_date: form.submission_date,
          deadline_date:   deadline,
          notes:           "",
          last_updated:    new Date().toISOString(),
          user_id:         user.id,
        })
        .select("id")
        .single();

      if (insertError) { setError(insertError.message); return; }
      router.push(`/dashboard/applications/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save application.");
    } finally {
      setSaving(false);
    }
  }

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelCls = "block text-sm font-medium text-gray-700 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-gray-700 transition-colors">
          ← Dashboard
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-sm text-gray-700 font-medium">Add Application</span>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-gray-900">Add Application</h1>
        <p className="text-sm text-gray-500 mt-1">Create a new planning application in your pipeline.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h2 className="text-sm font-semibold text-gray-900">Application Details</h2>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Reference Number <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.reference} onChange={e => set("reference", e.target.value)}
                placeholder="e.g. 24/1234" required />
            </div>
            <div>
              <label className={labelCls}>Submission Date <span className="text-red-500">*</span></label>
              <input type="date" className={inputCls} value={form.submission_date}
                onChange={e => set("submission_date", e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Client Name <span className="text-red-500">*</span></label>
              <input className={inputCls} value={form.client_name} onChange={e => set("client_name", e.target.value)}
                placeholder="Jane Murphy" required />
            </div>
            <div>
              <label className={labelCls}>Client Email</label>
              <input type="email" className={inputCls} value={form.client_email}
                onChange={e => set("client_email", e.target.value)} placeholder="jane@example.com" />
            </div>
          </div>

          <div>
            <label className={labelCls}>Property Address <span className="text-red-500">*</span></label>
            <input className={inputCls} value={form.address} onChange={e => set("address", e.target.value)}
              placeholder="12 Main Street, Carlow Town, Co. Carlow" required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Planning Authority</label>
              <select className={`${inputCls} bg-white`} value={form.council} onChange={e => set("council", e.target.value)}>
                <option value="">Select council…</option>
                {IRISH_COUNCILS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Project Type</label>
              <select className={`${inputCls} bg-white`} value={form.project_type} onChange={e => set("project_type", e.target.value)}>
                <option value="">Select type…</option>
                {PROJECT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
          </div>

          <p className="text-xs text-gray-400">
            The statutory deadline is automatically set to 8 weeks (56 days) from submission date. You can update it after saving.
          </p>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {saving ? "Saving…" : "Save Application"}
            </button>
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
