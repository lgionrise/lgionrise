// src/app/teacher/live-classes/schedule/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Batch } from "@/types/batch";
import { Loader2 } from "lucide-react";

export default function ScheduleClassPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
  batch: "", title: "", subject: "", scheduled_start: "", scheduled_end: "",
  recording_enabled: true, chat_enabled: true, student_camera_allowed: false, student_mic_allowed: false,
});

  // src/app/teacher/live-classes/schedule/page.tsx — useEffect update karo
useEffect(() => {
  fetch("/api/teacher/batches")
    .then(async (r) => {
      const data = await r.json();
      if (!r.ok) {
        setError(`Could not load batches: ${data.error || "unknown error"}`);
        return;
      }
      if (!data.results || data.results.length === 0) {
        setError("No batches found. Create a published batch first, then come back here.");
      }
      setBatches(data.results || []);
    })
    .catch(() => setError("Network error while loading batches."));
}, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);

    const res = await fetch("/api/teacher/live-classes/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    // src/app/teacher/live-classes/schedule/page.tsx — handleSubmit ke andar
    if (!res.ok) { setError(data.error || "Failed to schedule class."); setIsLoading(false); return; }

    if (!data.public_id) {
      setError("Class scheduled, but couldn't open it. Please check Upcoming Classes.");
      setIsLoading(false);
      return;
    }

    router.push(`/teacher/live-classes/${data.public_id}`);
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Schedule Live Class</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Batch</label>
          <select required value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm">
            <option value="">Select a batch</option>
            {batches.map((b) => <option key={b.public_id} value={b.public_id}>{b.title}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Class Title</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          <input placeholder="Subject (e.g. Physics)" value={form.subject}
  onChange={(e) => setForm({ ...form, subject: e.target.value })}
  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
            <input required type="datetime-local" value={form.scheduled_start}
              onChange={(e) => setForm({ ...form, scheduled_start: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time</label>
            <input required type="datetime-local" value={form.scheduled_end}
              onChange={(e) => setForm({ ...form, scheduled_end: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
        </div>

        <div className="space-y-2 pt-2">
          {[
            { key: "recording_enabled" as const, label: "Enable recording" },
            { key: "chat_enabled" as const, label: "Enable in-class chat" },
            { key: "student_camera_allowed" as const, label: "Allow student camera" },
            { key: "student_mic_allowed" as const, label: "Allow student mic" },
          ].map((toggle) => (
            <label key={toggle.key} className="flex items-center gap-2.5 text-sm text-slate-700">
              <input
                type="checkbox" checked={form[toggle.key]}
                onChange={(e) => setForm({ ...form, [toggle.key]: e.target.checked })}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              {toggle.label}
            </label>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Schedule Class
        </button>
      </form>
    </div>
  );
}
