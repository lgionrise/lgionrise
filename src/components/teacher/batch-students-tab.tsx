// src/components/teacher/batch-students-tab.tsx
"use client";

import { useState, useEffect } from "react";
import { EnrolledStudent } from "@/types/batch";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

export function BatchStudentsTab({ batchSlug }: { batchSlug: string }) {
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<EnrolledStudent | null>(null);

  useEffect(() => {
    fetch(`/api/teacher/batches/${batchSlug}/students`)
      .then((r) => r.json())
      .then((data) => { setStudents(data.results || []); setCount(data.count || 0); })
      .finally(() => setIsLoading(false));
  }, [batchSlug]);

  if (isLoading) return <p className="text-slate-500 text-sm">Loading students...</p>;

  return (
    <div>
      <p className="text-sm text-slate-500 mb-4">{count} enrolled student{count !== 1 ? "s" : ""}</p>

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {students.map((s) => (
          <button
            key={s.public_id}
            onClick={() => setSelected(s)}
            className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                {getInitials(s.student_name.split(" ")[0] || "", s.student_name.split(" ")[1] || "")}
              </div>
              <div>
                <p className="text-sm font-medium">{s.student_name}</p>
                <p className="text-xs text-slate-500">{s.student_email}</p>
              </div>
            </div>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {s.is_active ? "Active" : "Expired"}
            </span>
          </button>
        ))}
        {students.length === 0 && <p className="text-sm text-slate-500 p-4">No students enrolled yet.</p>}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-lg">{selected.student_name}</h3>
            <div className="mt-4 space-y-2 text-sm">
              <p><span className="text-slate-500">Email:</span> {selected.student_email}</p>
              <p><span className="text-slate-500">Phone:</span> {selected.student_phone || "—"}</p>
              <p><span className="text-slate-500">Class:</span> {selected.current_class || "—"}</p>
              <p><span className="text-slate-500">Target Exam:</span> {selected.target_exam || "—"}</p>
              <p><span className="text-slate-500">Enrolled:</span> {formatDate(selected.enrolled_at)}</p>
              <p><span className="text-slate-500">Expires:</span> {formatDate(selected.expires_at)}</p>
              <p><span className="text-slate-500">Amount Paid:</span> {formatCurrency(selected.amount_paid)}</p>
            </div>
            <button onClick={() => setSelected(null)} className="mt-5 w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2.5 rounded-lg text-sm">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}