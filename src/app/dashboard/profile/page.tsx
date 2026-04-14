"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const COUNTIES = [
  "Carlow","Cavan","Clare","Cork","Donegal","Dublin","Galway","Kerry","Kildare",
  "Kilkenny","Laois","Leitrim","Limerick","Longford","Louth","Mayo","Meath",
  "Monaghan","Offaly","Roscommon","Sligo","Tipperary","Waterford","Westmeath",
  "Wexford","Wicklow",
];

interface Profile {
  full_name: string;
  practice_name: string;
  county: string;
  email: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile>({ full_name: "", practice_name: "", county: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name, practice_name, county")
        .eq("id", user.id)
        .maybeSingle();
      const p = data as { full_name?: string; practice_name?: string; county?: string } | null;
      setProfile({
        full_name: p?.full_name ?? "",
        practice_name: p?.practice_name ?? "",
        county: p?.county ?? "",
        email: user.email ?? "",
      });
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated."); setSaving(false); return; }
    const { error: err } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: profile.full_name, practice_name: profile.practice_name, county: profile.county }, { onConflict: "id" });
    if (err) { setError("Failed to save profile. Please try again."); }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }

  const inputCls = "w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Your personal and practice details.</p>
      </div>

      {/* Avatar placeholder */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white text-2xl font-bold shrink-0">
          {profile.full_name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div>
          <p className="text-base font-semibold text-gray-900">{profile.full_name || "—"}</p>
          <p className="text-sm text-gray-500">{profile.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            type="text"
            className={inputCls}
            value={profile.full_name}
            onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
            placeholder="e.g. Jane Murphy"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Practice Name</label>
          <input
            type="text"
            className={inputCls}
            value={profile.practice_name}
            onChange={e => setProfile(p => ({ ...p, practice_name: e.target.value }))}
            placeholder="e.g. Murphy Architecture"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">County</label>
          <select
            className={inputCls}
            value={profile.county}
            onChange={e => setProfile(p => ({ ...p, county: e.target.value }))}
          >
            <option value="">Select county…</option>
            {COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
          <input
            type="email"
            className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`}
            value={profile.email}
            readOnly
            disabled
          />
          <p className="text-xs text-gray-400 mt-1.5">Email cannot be changed here. Contact support to update your email.</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
            Profile saved successfully.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
        >
          {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {saving ? "Saving…" : "Save Changes"}
        </button>
      </form>
    </div>
  );
}
