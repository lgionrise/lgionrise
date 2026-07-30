// src/app/teacher/tuition/availability/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { AvailabilitySlot } from "@/types/tuition";
import { Trash2 } from "lucide-react";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function TuitionAvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [form, setForm] = useState({ day_of_week: "0", start_time: "", end_time: "" });
  const [error, setError] = useState("");

  const loadSlots = async () => {
    const res = await fetch("/api/teacher/tuition/availability");
    const data = await res.json();
    setSlots(data.results || data || []);
  };

  useEffect(() => { loadSlots(); }, []);

  const handleAdd = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/teacher/tuition/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, day_of_week: parseInt(form.day_of_week) }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Failed to add slot."); return; }
    setForm({ day_of_week: "0", start_time: "", end_time: "" });
    loadSlots();
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-xl font-semibold text-slate-900">Weekly Availability</h1>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {DAYS.map((day, dayIndex) => {
          const daySlots = slots.filter((s) => s.day_of_week === dayIndex);
          return (
            <div key={day} className="px-4 py-3">
              <p className="text-sm font-medium mb-1">{day}</p>
              {daySlots.length === 0 ? (
                <p className="text-xs text-slate-400">No slots</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {daySlots.map((slot) => (
                    <span key={slot.public_id} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-full">
                      {slot.start_time} - {slot.end_time}
                      <button type="button" onClick={() => setSlots(slots.filter((s) => s.public_id !== slot.public_id))}>
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="text-sm font-medium text-slate-700">Add Slot</h3>
        <div className="grid grid-cols-3 gap-3">
          <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
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