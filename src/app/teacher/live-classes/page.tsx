// src/app/teacher/live-classes/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LiveClass } from "@/types/live-class";
import { formatDateTime } from "@/lib/utils";
import { Plus, Video } from "lucide-react";

const statusStyles: Record < string, string > = {
  scheduled: "bg-indigo-100 text-indigo-700",
  live: "bg-red-100 text-red-700",
  ended: "bg-slate-100 text-slate-500",
  cancelled: "bg-amber-100 text-amber-700",
};

export default function LiveClassesPage() {
  const [classes, setClasses] = useState < LiveClass[] > ([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetch("/api/teacher/live-classes")
      .then((r) => r.json())
      .then((data) => setClasses(data.results || []))
      .finally(() => setIsLoading(false));
  }, []);
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Live Classes</h1>
        <Link
          href="/teacher/live-classes/schedule"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Schedule Class
        </Link>
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : classes.length === 0 ? (
        <p className="text-slate-500 text-center py-16">No upcoming classes scheduled.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {classes.map((cls) => (
            <Link
              key={cls.public_id}
              href={`/teacher/live-classes/${cls.public_id}`}
              className="flex items-center justify-between px-5 py-4 hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-lg">
                  <Video className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-slate-900">{cls.title}</p>
                  <p className="text-xs text-slate-500">{cls.batch_title} • {formatDateTime(cls.scheduled_start)}</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusStyles[cls.status]}`}>
                {cls.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}