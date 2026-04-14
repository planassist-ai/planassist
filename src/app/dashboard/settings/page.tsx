"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/app/components/DashboardShell";
import { useAuthStatus } from "@/app/hooks/useAuthStatus";

const IRISH_COUNTIES = [
  "Carlow", "Cavan", "Clare", "Cork", "Donegal", "Dublin", "Galway", "Kerry",
  "Kildare", "Kilkenny", "Laois", "Leitrim", "Limerick", "Longford", "Louth",
  "Mayo", "Meath", "Monaghan", "Offaly", "Roscommon", "Sligo", "Tipperary",
  "Waterford", "Westmeath", "Wexford", "Wicklow",
];

const SPECIALISM_OPTIONS = [
  "Residential Extension", "New Dwelling", "Commercial", "Industrial",
  "Change of Use", "Protected Structure", "One-Off Rural Housing",
  "Social Housing", "Retail", "Hospitality", "Healthcare", "Education",
  "Agricultural", "Conservation / Restoration", "Interior Architecture",
];

interface Profile {
  full_name: string;
  practice_name: string;
  county: string;
  email: string;
  num_architects: number;
  specialisms: string[];
  counties_covered: string[];
  email_alerts: boolean;
}

export default function SettingsPage() {
  const { userEmail } = useAuthStatus();

  const [profile, setProfile] = useState<Profile>({
    full_name: "",
    practice_name: "",
    county: "",
    email: userEmail ?? "",
    num_architects: 1,
    specialisms: [],
    counties_covered: [],
    email_alerts: true,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, "idle" | "saving" | "saved" | "error">>({
    profile: "idle",
    practice: "idle",
    notifications: "idle",
  });
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/update-profile");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (data.profile) setProfile(prev => ({ ...prev, ...data.profile }));
      } catch {
        setLoadError("Could not load your profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function save(section: string, fields: Partial<Profile>) {
    setSaving(prev => ({ ...prev, [section]: "saving" }));
    try {
      const res = await fetch("/api/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to save");
      }
      setSaving(prev => ({ ...prev, [section]: "saved" }));
      setTimeout(() => setSaving(prev => ({ ...prev, [section]: "idle" })), 2500);
    } catch (err) {
      console.error(err);
      setSaving(prev => ({ ...prev, [section]: "error" }));
      setTimeout(() => setSaving(prev => ({ ...prev, [section]: "idle" })), 3000);
    }
  }

  function toggleSpecialism(s: string) {
    setProfile(prev => ({
      ...prev,
      specialisms: prev.specialisms.includes(s)
        ? prev.specialisms.filter(x => x !== s)
        : [...prev.specialisms, s],
    }));
  }

  function toggleCounty(c: string) {
    setProfile(prev => ({
      ...prev,
      counties_covered: prev.counties_covered.includes(c)
        ? prev.counties_covered.filter(x => x !== c)
        : [...prev.counties_covered, c],
    }));
  }

  function SaveButton({ section }: { section: string }) {
    const s = saving[section];
    return (
      <button
        onClick={() => {
          if (section === "profile") save("profile", { full_name: profile.full_name, practice_name: profile.practice_name, county: profile.county });
          if (section === "practice") save("practice", { num_architects: profile.num_architects, specialisms: profile.specialisms, counties_covered: profile.counties_covered });
          if (section === "notifications") save("notifications", { email_alerts: profile.email_alerts });
        }}
        disabled={s === "saving"}
        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        {s === "saving" && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {s === "saving" ? "Saving…" : s === "saved" ? "Saved" : s === "error" ? "Error — try again" : "Save changes"}
      </button>
    );
  }

  if (loading) {
    return (
      <DashboardShell breadcrumb={[{ label: "Settings" }]}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell breadcrumb={[{ label: "Settings" }]}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-8">

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Settings</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your profile, practice details, and preferences.</p>
        </div>

        {loadError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{loadError}</div>
        )}

        {/* Profile section */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Profile</h2>
            <p className="text-xs text-gray-500 mt-0.5">Your personal and practice identity on Granted.</p>
          </div>
          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))}
                  placeholder="Jane Murphy"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  value={profile.email}
                  disabled
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-400 mt-1">Email cannot be changed here. Contact support.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Practice name</label>
                <input
                  type="text"
                  value={profile.practice_name}
                  onChange={e => setProfile(p => ({ ...p, practice_name: e.target.value }))}
                  placeholder="Murphy Architecture"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">County</label>
                <select
                  value={profile.county}
                  onChange={e => setProfile(p => ({ ...p, county: e.target.value }))}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="">Select county…</option>
                  {IRISH_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="pt-2">
              <SaveButton section="profile" />
            </div>
          </div>
        </section>

        {/* Practice details section */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Practice Details</h2>
            <p className="text-xs text-gray-500 mt-0.5">Information about the size and scope of your practice.</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Number of architects</label>
              <select
                value={profile.num_architects}
                onChange={e => setProfile(p => ({ ...p, num_architects: Number(e.target.value) }))}
                className="w-full sm:w-48 border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                {[1,2,3,4,5,6,7,8,9,10].map(n => <option key={n} value={n}>{n}</option>)}
                <option value={15}>11–15</option>
                <option value={20}>16–20</option>
                <option value={25}>21+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Specialisms</label>
              <div className="flex flex-wrap gap-2">
                {SPECIALISM_OPTIONS.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => toggleSpecialism(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      profile.specialisms.includes(s)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Counties covered</label>
              <div className="flex flex-wrap gap-2">
                {IRISH_COUNTIES.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => toggleCounty(c)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      profile.counties_covered.includes(c)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <SaveButton section="practice" />
            </div>
          </div>
        </section>

        {/* Notifications section */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Notifications</h2>
            <p className="text-xs text-gray-500 mt-0.5">Control when Granted sends you email alerts.</p>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="text-sm font-medium text-gray-900">Email alerts</p>
                <p className="text-xs text-gray-500 mt-0.5">Receive email notifications for FI requests, decision changes, and deadline reminders.</p>
              </div>
              <button
                type="button"
                onClick={() => setProfile(p => ({ ...p, email_alerts: !p.email_alerts }))}
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                  profile.email_alerts ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition-transform ${
                  profile.email_alerts ? "translate-x-5" : "translate-x-0"
                }`} />
              </button>
            </label>
            <div className="pt-2">
              <SaveButton section="notifications" />
            </div>
          </div>
        </section>

        {/* Account section */}
        <section className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Account</h2>
            <p className="text-xs text-gray-500 mt-0.5">Password and account management.</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div>
                <p className="text-sm font-medium text-gray-900">Change password</p>
                <p className="text-xs text-gray-500 mt-0.5">Send a password reset link to your email address.</p>
              </div>
              <a
                href={`mailto:hello@granted.ie?subject=Password%20Reset%20Request&body=Please%20send%20me%20a%20password%20reset%20link%20for%20${encodeURIComponent(profile.email)}`}
                className="shrink-0 px-4 py-2 border border-gray-300 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Request reset
              </a>
            </div>
            <div className="flex items-center justify-between p-4 border border-red-100 rounded-xl bg-red-50">
              <div>
                <p className="text-sm font-medium text-red-900">Delete account</p>
                <p className="text-xs text-red-600 mt-0.5">Permanently remove your account and all data.</p>
              </div>
              <a
                href={`mailto:hello@granted.ie?subject=Account%20Deletion%20Request&body=Please%20delete%20my%20account%20associated%20with%20${encodeURIComponent(profile.email)}`}
                className="shrink-0 px-4 py-2 border border-red-300 text-sm font-medium text-red-700 rounded-lg hover:bg-red-100 transition-colors"
              >
                Contact us
              </a>
            </div>
          </div>
        </section>

      </div>
    </DashboardShell>
  );
}
