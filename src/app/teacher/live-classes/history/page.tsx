// src/app/teacher/live-classes/history/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LiveClass } from "@/types/live-class";
import { cn, formatDateTime } from "@/lib/utils";

const statusStyles: Record<string, string> = {
  ended: "bg-slate-100 text-slate-500",
  cancelled: "bg-amber-100 text-amber-700",
};

export default function LiveClassHistoryPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/live-classes/history")
      .then((r) => r.json())
      .then((data) => setClasses(data.results || []))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Class History</h1>
        <Link href="/teacher/live-classes" className="text-sm font-medium text-indigo-600">← Upcoming Classes</Link>
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {classes.map((cls) => (
            <Link key={cls.public_id} href={`/teacher/live-classes/${cls.public_id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
              <div>
                <p className="font-medium text-sm text-slate-900">{cls.title}</p>
                <p className="text-xs text-slate-500">{cls.batch_title} • {formatDateTime(cls.scheduled_start)}</p>
              </div>
              <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusStyles[cls.status])}>
                {cls.status}
              </span>
            </Link>
          ))}
          {classes.length === 0 && <p className="text-sm text-slate-500 p-4">No past classes yet.</p>}
        </div>
      )}
    </div>
  );
}
