// src/components/teacher/batch-schedule-tab.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { BatchScheduleSlot } from "@/types/batch";
import { Trash2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function BatchScheduleTab({ batchSlug }: { batchSlug: string }) {
  const [slots, setSlots] = useState < BatchScheduleSlot[] > ([]);
  const [form, setForm] = useState({ day_of_week: "0", start_time: "", end_time: "", subject: "" });
  const [error, setError] = useState("");
  
  const loadSlots = async () => {
    const res = await fetch(`/api/teacher/batches/${batchSlug}/schedule`);
    const data = await res.json();
    setSlots(data.results || data || []);
  };
  
  useEffect(() => { loadSlots(); }, [batchSlug]);
  
  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch(`/api/teacher/batches/${batchSlug}/schedule`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, day_of_week: parseInt(form.day_of_week) }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to add slot."); return; }
    setForm({ day_of_week: "0", start_time: "", end_time: "", subject: "" });
    loadSlots();
  };
  
  const handleDelete = async (publicId: string) => {
    await fetch(`/api/teacher/batches/schedule/${publicId}`, { method: "DELETE" });
    loadSlots();
  };
  
  return (
    <div className="max-w-xl space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {slots.length === 0 && <p className="text-sm text-slate-500 p-4">No schedule slots added yet.</p>}
        {slots.map((slot) => (
          <div key={slot.public_id} className="flex items-center justify-between px-4 py-3">
            <div>
              <span className="font-medium text-sm">{DAYS[slot.day_of_week]}</span>
              <span className="text-sm text-slate-500 ml-3">{slot.start_time} - {slot.end_time}</span>
              {slot.subject && <span className="text-sm text-slate-400 ml-2">• {slot.subject}</span>}
            </div>
            <button onClick={() => handleDelete(slot.public_id)} className="text-slate-400 hover:text-red-600">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-medium text-slate-700">Add Slot</h3>
        <div className="grid grid-cols-2 gap-3">
          <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
          <input placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="time" required value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
          <input type="time" required value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm" />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2 rounded-lg text-sm">
          Add Slot
        </button>
      </form>
    </div>
  );
}