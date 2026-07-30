// src/app/teacher/doubts/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DoubtListItem } from "@/types/doubt";
import { cn, formatDateTime } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  answered: "bg-indigo-100 text-indigo-700",
  resolved: "bg-emerald-100 text-emerald-700",
  reopened: "bg-rose-100 text-rose-700",
};

export default function DoubtsPage() {
  const [doubts, setDoubts] = useState<DoubtListItem[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/teacher/doubts${params}`)
      .then((r) => r.json())
      .then((data) => setDoubts(data.results || []))
      .finally(() => setIsLoading(false));
  }, [statusFilter]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Doubts</h1>

      <div className="flex gap-2 mb-4">
        {["", "open", "answered", "resolved", "reopened"].map((s) => (
          <button
            key={s} onClick={() => setStatusFilter(s)}
            className={cn("text-xs font-medium px-3 py-1.5 rounded-full capitalize",
              statusFilter === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {doubts.map((doubt) => (
            <Link key={doubt.public_id} href={`/teacher/doubts/${doubt.public_id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
              <div className="flex-1 pr-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium">{doubt.student_name}</span>
                  {doubt.priority === "urgent" && <span className="text-xs font-medium text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">Urgent</span>}
                </div>
                <p className="text-sm text-slate-500 line-clamp-1">{doubt.text_content}</p>
                <p className="text-xs text-slate-400 mt-1">{formatDateTime(doubt.created_at)} • {doubt.reply_count} replies</p>
              </div>
              <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full capitalize", statusStyles[doubt.status])}>
                {doubt.status}
              </span>
            </Link>
          ))}
          {doubts.length === 0 && <p className="text-sm text-slate-500 p-4">No doubts found.</p>}
        </div>
      )}
    </div>
  );
}