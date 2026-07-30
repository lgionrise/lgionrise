// src/app/teacher/notifications/settings/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { NotificationPreferences } from "@/types/notification";
import { Loader2 } from "lucide-react";

const toggleFields: { key: keyof NotificationPreferences; label: string }[] = [
  { key: "push_enabled", label: "Push notifications" },
  { key: "email_enabled", label: "Email notifications" },
  { key: "sms_enabled", label: "SMS notifications" },
  { key: "class_reminders_enabled", label: "Class reminders" },
  { key: "test_reminders_enabled", label: "Test reminders" },
  { key: "payment_alerts_enabled", label: "Payment alerts" },
  { key: "content_alerts_enabled", label: "New content alerts" },
  { key: "doubt_alerts_enabled", label: "Doubt alerts" },
  { key: "offer_alerts_enabled", label: "Offer/discount alerts" },
];

export default function NotificationSettingsPage() {
  const [prefs, setPrefs] = useState<NotificationPreferences | null>(null);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetch("/api/teacher/notifications/preferences").then((r) => r.json()).then(setPrefs);
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!prefs) return;
    setIsSaving(true); setMessage("");
    const res = await fetch("/api/teacher/notifications/preferences", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefs),
    });
    if (res.ok) setMessage("Preferences saved.");
    setIsSaving(false);
  };

  if (!prefs) return <p className="text-slate-500 text-sm">Loading...</p>;

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Notification Settings</h1>
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
        {toggleFields.map((field) => (
          <label key={field.key} className="flex items-center justify-between text-sm text-slate-700">
            {field.label}
            <input
              type="checkbox" checked={prefs[field.key] as boolean}
              onChange={(e) => setPrefs({ ...prefs, [field.key]: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600"
            />
          </label>
        ))}

        <div className="border-t border-slate-100 pt-3">
          <label className="flex items-center justify-between text-sm text-slate-700 mb-3">
            Do Not Disturb
            <input
              type="checkbox" checked={prefs.dnd_enabled}
              onChange={(e) => setPrefs({ ...prefs, dnd_enabled: e.target.checked })}
              className="rounded border-slate-300 text-indigo-600"
            />
          </label>
          {prefs.dnd_enabled && (
            <div className="grid grid-cols-2 gap-3">
              <input type="time" value={prefs.dnd_start_time || ""} onChange={(e) => setPrefs({ ...prefs, dnd_start_time: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              <input type="time" value={prefs.dnd_end_time || ""} onChange={(e) => setPrefs({ ...prefs, dnd_end_time: e.target.value })}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
            </div>
          )}
        </div>

        {message && <p className="text-sm text-emerald-600">{message}</p>}

        <button type="submit" disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save
        </button>
      </form>
    </div>
  );
}
