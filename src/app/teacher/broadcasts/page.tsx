// src/app/teacher/broadcasts/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage, formatDateTime } from "@/lib/utils";
import { Megaphone, Plus } from "lucide-react";

interface Batch { public_id: string; title: string }
interface Broadcast { public_id: string; title: string; message: string; target_audience: string; created_at: string }

export default function BroadcastsPage() {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", target_audience: "batch", batch: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    fetch("/api/teacher/broadcasts").then((r) => r.json()).then((d) => setBroadcasts(d.results || [])).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); fetch("/api/teacher/batches").then((r) => r.json()).then((d) => setBatches(d.results || [])); }, []);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setIsSubmitting(true);

    const res = await fetch("/api/teacher/broadcasts", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();
    setIsSubmitting(false);

    if (!res.ok) { setError(getErrorMessage(data.error) || "Failed to send broadcast."); return; }
    setForm({ title: "", message: "", target_audience: "batch", batch: "" });
    setShowForm(false);
    load();
  };

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="teacher" />
      <div className="w-full max-w-2xl mx-auto px-4 pt-24 pb-24 lg:pb-8 overflow-x-hidden">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-900">Broadcast Announcements</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white p-2.5 rounded-full shadow-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSend} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 mb-5 w-full">
            <select value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50">
              <option value="">Select batch</option>
              {batches.map((b) => <option key={b.public_id} value={b.public_id}>{b.title}</option>)}
            </select>
            <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Announcement title" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />
            <textarea required rows={3} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="Message" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />
            {error && <p className="text-sm text-red-600 break-words">{error}</p>}
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-indigo-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
              <Megaphone className="w-4 h-4" /> Send Broadcast
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : (
          <div className="space-y-2">
            {broadcasts.map((b) => (
              <div key={b.public_id} className="bg-white rounded-2xl p-3.5 shadow-sm">
                <p className="text-sm font-semibold">{b.title}</p>
                <p className="text-xs text-slate-500 mt-0.5 break-words">{b.message}</p>
                <p className="text-[10px] text-slate-400 mt-1.5">{formatDateTime(b.created_at)}</p>
              </div>
            ))}
            {broadcasts.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No broadcasts sent yet.</p>}
          </div>
        )}
      </div>
    </>
  );
}
