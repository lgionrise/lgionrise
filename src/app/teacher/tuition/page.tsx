// src/app/teacher/tuition/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { TuitionProfile } from "@/types/tuition";
import { getErrorMessage } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function TuitionSettingsPage() {
  const [profile, setProfile] = useState<TuitionProfile | null>(null);
  const [durationsInput, setDurationsInput] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/tuition/profile")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) { setError(getErrorMessage(data.error)); return; }
        setProfile(data);
        setDurationsInput((data.session_durations_minutes || []).join(", "));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError(""); setMessage(""); setIsSaving(true);

    const durations = durationsInput.split(",").map((s) => parseInt(s.trim())).filter((n) => !isNaN(n));

    const res = await fetch("/api/teacher/tuition/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...profile, session_durations_minutes: durations }),
    });
    const data = await res.json();

    if (!res.ok) { setError(getErrorMessage(data.error) || "Failed to save."); setIsSaving(false); return; }
    setMessage("Settings saved.");
    setIsSaving(false);
  };

  if (isLoading) return <p className="text-slate-500 text-sm">Loading...</p>;
  if (!profile) return <p className="text-red-600 text-sm">{error || "Could not load tuition profile."}</p>;

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Private Tuition Settings</h1>
        <div className="flex gap-3">
          <Link href="/teacher/tuition/availability" className="text-sm font-medium text-indigo-600">Availability</Link>
          <Link href="/teacher/tuition/bookings" className="text-sm font-medium text-indigo-600">Bookings</Link>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <input type="checkbox" checked={profile.is_active} onChange={(e) => setProfile({ ...profile, is_active: e.target.checked })}
            className="rounded border-slate-300 text-indigo-600" />
          Accepting private tuition bookings
        </label>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
          <input value={profile.subject} onChange={(e) => setProfile({ ...profile, subject: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea rows={3} value={profile.description} onChange={(e) => setProfile({ ...profile, description: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price per Session (₹)</label>
            <input type="number" value={profile.price_per_session}
              onChange={(e) => setProfile({ ...profile, price_per_session: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Group Size</label>
            <input type="number" value={profile.max_group_size}
              onChange={(e) => setProfile({ ...profile, max_group_size: parseInt(e.target.value) || 1 })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Session Durations (minutes, comma-separated)</label>
          <input value={durationsInput} onChange={(e) => setDurationsInput(e.target.value)}
            placeholder="30, 45, 60"
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Booking Window (days ahead)</label>
            <input type="number" value={profile.booking_window_days}
              onChange={(e) => setProfile({ ...profile, booking_window_days: parseInt(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Cancellation Notice (hours)</label>
            <input type="number" value={profile.cancellation_notice_hours}
              onChange={(e) => setProfile({ ...profile, cancellation_notice_hours: parseInt(e.target.value) || 0 })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Cancellation Policy</label>
          <textarea rows={2} value={profile.cancellation_policy} onChange={(e) => setProfile({ ...profile, cancellation_policy: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Reschedule Policy</label>
          <textarea rows={2} value={profile.reschedule_policy} onChange={(e) => setProfile({ ...profile, reschedule_policy: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        {message && <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{message}</p>}

        <button type="submit" disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Settings
        </button>
      </form>
    </div>
  );
}