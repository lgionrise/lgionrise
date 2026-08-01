// src/app/student/live-classes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StudentLiveClass } from "@/types/student";
import { cn, formatDateTime } from "@/lib/utils";
import { Video } from "lucide-react";

const statusStyles: Record<string, string> = {
  scheduled: "bg-indigo-100 text-indigo-700",
  live: "bg-red-100 text-red-700",
  ended: "bg-slate-100 text-slate-500",
  cancelled: "bg-amber-100 text-amber-700",
};

export default function StudentLiveClassesPage() {
  const router = useRouter();
  const [classes, setClasses] = useState<StudentLiveClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/live-classes")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) { setError(data.error || "Could not load classes."); return; }
        setClasses(data.results || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Upcoming Live Classes</h1>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : classes.length === 0 ? (
        <p className="text-slate-500 text-center py-16">No upcoming live classes in your enrolled batches.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {classes.map((cls) => (
            <div key={cls.public_id} className="flex items-center justify-between px-5 py-4">
              <div>
                <p className="font-medium text-sm text-slate-900">{cls.title}</p>
                <p className="text-xs text-slate-500">{cls.batch_title} • {cls.teacher_name} • {formatDateTime(cls.scheduled_start)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full", statusStyles[cls.status])}>
                  {cls.status}
                </span>
                {cls.status === "live" && (
                  <button
                    onClick={() => router.push(`/student/live-classes/${cls.public_id}/watch`)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg"
                  >
                    <Video className="w-3.5 h-3.5" /> Join
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
