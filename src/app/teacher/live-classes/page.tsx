// src/app/teacher/live-classes/page.tsx — poori file replace karo
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LiveClass } from "@/types/live-class";
import { formatDateTime } from "@/lib/utils";
import { Plus, Video, History } from "lucide-react";

const statusStyles: Record<string, string> = {
  scheduled: "bg-indigo-100 text-indigo-700",
  live: "bg-red-100 text-red-700",
  ended: "bg-slate-100 text-slate-500",
  cancelled: "bg-amber-100 text-amber-700",
};

export default function LiveClassesPage() {
  const [classes, setClasses] = useState<LiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/teacher/live-classes")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) { setError(data.error || `Failed to load classes (status ${r.status}).`); return; }
        setClasses(data.results || []);
      })
      .catch(() => setError("Network error while loading classes."))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Live Classes</h1>
        <div className="flex gap-2">
          <Link href="/teacher/live-classes/history" className="text-slate-500 p-2.5 bg-slate-100 rounded-lg">
            <History className="w-4 h-4" />
          </Link>
          <Link href="/teacher/live-classes/schedule" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Schedule Class
          </Link>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : classes.length === 0 && !error ? (
        <p className="text-slate-500 text-center py-16">No upcoming classes scheduled.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {classes.map((cls) => (
            <Link key={cls.public_id} href={`/teacher/live-classes/${cls.public_id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-lg"><Video className="w-4 h-4 text-indigo-600" /></div>
                <div>
                  <p className="font-medium text-sm text-slate-900">{cls.title}</p>
                  <p className="text-xs text-slate-500">{cls.batch_title} • {formatDateTime(cls.scheduled_start)}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[cls.status]}`}>{cls.status}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
