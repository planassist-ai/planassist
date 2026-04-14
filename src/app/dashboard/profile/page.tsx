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

export default function ProfilePage() {
  const { userEmail } = useAuthStatus();

  const [fullName, setFullName] = useState("");
  const [practiceName, setPracticeName] = useState("");
  const [county, setCounty] = useState("");
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/update-profile");
        if (!res.ok) throw new Error("Failed to load");
        const data = await res.json();
        if (data.profile) {
          setFullName(data.profile.full_name ?? "");
          setPracticeName(data.profile.practice_name ?? "");
          setCounty(data.profile.county ?? "");
        }
      } catch {
        setErrorMsg("Could not load your profile. Please refresh.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaveState("saving");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/update-profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: fullName, practice_name: practiceName, county }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error((data as { error?: string }).error ?? "Failed to save");
      }
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 2500);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
      setSaveState("error");
      setTimeout(() => setSaveState("idle"), 3000);
    }
  }

  if (loading) {
    return (
      <DashboardShell breadcrumb={[{ label: "My Profile" }]}>
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-gray-200 rounded" />
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
              {[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-xl" />)}
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell breadcrumb={[{ label: "My Profile" }]}>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-10">

        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-sm text-gray-500 mt-1">Update your name, practice name, and county.</p>
        </div>

        {errorMsg && (
          <div className="mb-5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{errorMsg}</div>
        )}

        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-semibold text-gray-900">Personal &amp; Practice Details</h2>
          </div>
          <div className="p-6 space-y-5">

            {/* Avatar placeholder */}
            <div className="flex items-center gap-4 mb-2">
              <div className="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {fullName ? fullName[0].toUpperCase() : (userEmail ? userEmail[0].toUpperCase() : "A")}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{fullName || "Your name"}</p>
                <p className="text-xs text-gray-500">{userEmail ?? ""}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Jane Murphy"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={userEmail ?? ""}
                disabled
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-400 mt-1">To change your email address, contact <a href="mailto:hello@granted.ie" className="text-blue-600 hover:underline">hello@granted.ie</a>.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Practice name</label>
              <input
                type="text"
                value={practiceName}
                onChange={e => setPracticeName(e.target.value)}
                placeholder="Murphy Architecture"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">County</label>
              <select
                value={county}
                onChange={e => setCounty(e.target.value)}
                className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              >
                <option value="">Select your county…</option>
                {IRISH_COUNTIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="pt-2 flex items-center gap-3">
              <button
                type="submit"
                disabled={saveState === "saving"}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {saveState === "saving" && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Save changes"}
              </button>
              {saveState === "saved" && (
                <p className="text-sm text-green-600 font-medium">Profile updated.</p>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
