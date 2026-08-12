// src/app/student/batches/[slug]/live-classes/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { StudentLiveClass } from "@/types/student";
import { cn, formatDateTime } from "@/lib/utils";

type ClassWithSubject = StudentLiveClass & { subject: string };

const statusStyles: Record<string, string> = {
  scheduled: "bg-indigo-100 text-indigo-700",
  live: "bg-red-100 text-red-700",
  ended: "bg-slate-100 text-slate-500",
  cancelled: "bg-amber-100 text-amber-700",
};

export default function BatchLiveClassesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [classes, setClasses] = useState<ClassWithSubject[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/student/batches/${slug}/live-classes`)
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) { setError(data.error || "Could not load classes."); return; }
        setClasses(data.results || []);
      })
      .finally(() => setIsLoading(false));
  }, [slug]);

  // Group by subject so each teacher's classes are visually distinct
  const bySubject = classes.reduce<Record<string, ClassWithSubject[]>>((acc, cls) => {
    const key = cls.subject || "General";
    (acc[key] ||= []).push(cls);
    return acc;
  }, {});

  return (
    <div className="p-5">
      <h1 className="text-lg font-bold text-slate-900 mb-5">All Classes</h1>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}
      {isLoading && <p className="text-slate-500 text-sm">Loading...</p>}

      {Object.entries(bySubject).map(([subject, items]) => (
        <div key={subject} className="mb-6">
          <h2 className="text-sm font-semibold text-indigo-600 mb-2">{subject}</h2>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {items.map((cls) => (
              <div key={cls.public_id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{cls.title}</p>
                  <p className="text-xs text-slate-500">{cls.teacher_name} • {formatDateTime(cls.scheduled_start)}</p>
                </div>
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusStyles[cls.status])}>
                  {cls.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {!isLoading && classes.length === 0 && !error && (
        <p className="text-slate-500 text-center py-16 text-sm">No classes recorded for this batch yet.</p>
      )}
    </div>
  );
}
