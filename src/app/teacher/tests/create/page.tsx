// src/app/teacher/tests/create/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Batch } from "@/types/batch";
import { getErrorMessage } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function CreateTestPage() {
  const router = useRouter();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    batch: "", title: "", test_type: "chapter_wise", duration_minutes: 60, total_marks: 100,
    negative_marking_enabled: false, negative_marks_per_question: 1,
    availability_start: "", availability_end: "", max_attempts_allowed: 1,
  });

  // src/app/teacher/tests/create/page.tsx — useEffect update karo (same pattern)
useEffect(() => {
  fetch("/api/teacher/batches")
    .then(async (r) => {
      const data = await r.json();
      if (!r.ok) {
        setError(`Could not load batches: ${data.error || "unknown error"}`);
        return;
      }
      setBatches(data.results || []);
    })
    .catch(() => setError("Network error while loading batches."));
}, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);

    const res = await fetch("/api/teacher/tests", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) { setError(getErrorMessage(data.error) || "Failed to create test."); setIsLoading(false); return; }
    router.push(`/teacher/tests/${data.public_id}`);
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Create Test</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Batch</label>
          <select required value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm">
            <option value="">Select batch</option>
            {batches.map((b) => <option key={b.public_id} value={b.public_id}>{b.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
          <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Test Type</label>
          <select value={form.test_type} onChange={(e) => setForm({ ...form, test_type: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm">
            <option value="chapter_wise">Chapter-wise</option>
            <option value="topic_wise">Topic-wise</option>
            <option value="subject_wise">Subject-wise</option>
            <option value="full_syllabus">Full Syllabus</option>
            <option value="mock_test">Mock Test</option>
            <option value="previous_year">Previous Year Paper</option>
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (minutes)</label>
            <input type="number" required value={form.duration_minutes}
              onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Total Marks</label>
            <input type="number" required value={form.total_marks}
              onChange={(e) => setForm({ ...form, total_marks: parseFloat(e.target.value) })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Available From</label>
            <input type="datetime-local" required value={form.availability_start}
              onChange={(e) => setForm({ ...form, availability_start: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Available Until</label>
            <input type="datetime-local" required value={form.availability_end}
              onChange={(e) => setForm({ ...form, availability_end: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Attempts Allowed</label>
          <input type="number" value={form.max_attempts_allowed}
            onChange={(e) => setForm({ ...form, max_attempts_allowed: parseInt(e.target.value) })}
            className="w-32 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <input type="checkbox" checked={form.negative_marking_enabled}
            onChange={(e) => setForm({ ...form, negative_marking_enabled: e.target.checked })}
            className="rounded border-slate-300 text-indigo-600" />
          Enable negative marking
        </label>
        {form.negative_marking_enabled && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Negative Marks per Question</label>
            <input type="number" step="0.25" value={form.negative_marks_per_question}
              onChange={(e) => setForm({ ...form, negative_marks_per_question: parseFloat(e.target.value) })}
              className="w-32 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
        )}

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Test
        </button>
      </form>
    </div>
  );
}