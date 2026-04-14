"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface NotifSettings {
  notify_deadlines: boolean;
  notify_decisions: boolean;
  notify_rfis: boolean;
  notify_weekly_summary: boolean;
}

const DEFAULT: NotifSettings = {
  notify_deadlines: true,
  notify_decisions: true,
  notify_rfis: true,
  notify_weekly_summary: false,
};

const TOGGLES: { key: keyof NotifSettings; label: string; description: string }[] = [
  {
    key: "notify_deadlines",
    label: "Deadline reminders",
    description: "Receive an email 7 days before a statutory decision deadline.",
  },
  {
    key: "notify_decisions",
    label: "Decision notifications",
    description: "Get notified when a planning decision is recorded on an application.",
  },
  {
    key: "notify_rfis",
    label: "RFI alerts",
    description: "Be alerted when a Request for Further Information is issued.",
  },
  {
    key: "notify_weekly_summary",
    label: "Weekly pipeline summary",
    description: "A weekly digest of your active applications and upcoming deadlines.",
  },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<NotifSettings>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("profiles")
        .select("notify_deadlines, notify_decisions, notify_rfis, notify_weekly_summary")
        .eq("id", user.id)
        .maybeSingle();
      if (data) {
        const d = data as Partial<NotifSettings>;
        setSettings({
          notify_deadlines:      d.notify_deadlines      ?? true,
          notify_decisions:      d.notify_decisions      ?? true,
          notify_rfis:           d.notify_rfis           ?? true,
          notify_weekly_summary: d.notify_weekly_summary ?? false,
        });
      }
      setLoading(false);
    }
    load();
  }, []);

  async function handleSave() {
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated."); setSaving(false); return; }
    const { error: err } = await supabase
      .from("profiles")
      .upsert({ id: user.id, ...settings }, { onConflict: "id" });
    if (err) { setError("Failed to save settings. Please try again."); }
    else { setSaved(true); setTimeout(() => setSaved(false), 3000); }
    setSaving(false);
  }

  function toggle(key: keyof NotifSettings) {
    setSettings(s => ({ ...s, [key]: !s[key] }));
  }

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
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your notification preferences.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Email Notifications</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {TOGGLES.map(({ key, label, description }) => (
            <div key={key} className="px-5 py-4 flex items-start justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-gray-800">{label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{description}</p>
              </div>
              <button
                role="switch"
                aria-checked={settings[key]}
                onClick={() => toggle(key)}
                className={[
                  "shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                  settings[key] ? "bg-blue-700" : "bg-gray-200",
                ].join(" ")}
              >
                <span
                  className={[
                    "inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform",
                    settings[key] ? "translate-x-6" : "translate-x-1",
                  ].join(" ")}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700">
          Settings saved successfully.
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
      >
        {saving && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
        {saving ? "Saving…" : "Save Settings"}
      </button>

      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4">
        <p className="text-sm text-blue-700">
          More settings — practice details, counties covered, and integrations — coming soon. Contact{" "}
          <a href="mailto:hello@granted.ie" className="font-semibold underline">hello@granted.ie</a> for any immediate requests.
        </p>
      </div>
    </div>
  );
}
