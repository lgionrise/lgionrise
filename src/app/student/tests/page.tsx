// src/app/student/tests/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Clock } from "lucide-react";

interface Test { public_id: string; title: string; test_type: string; duration_minutes: number; total_marks: number; has_attempted: boolean }

export default function StudentTestsPage() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/tests").then(async (r) => {
      const d = await r.json();
      if (!r.ok) { setError(d.error || "Could not load tests."); return; }
      setTests(d.results || []);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleStart = async (testId: string) => {
    const res = await fetch(`/api/student/tests/${testId}/start`, { method: "POST" });
    const data = await res.json();
    if (!res.ok) { alert(data.error || "Could not start test."); return; }
    router.push(`/student/tests/${testId}/attempt/${data.attempt_id}`);
  };

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="student" />
      <div className="pt-24 px-4 pb-5">
        <h1 className="text-lg font-bold text-slate-900 mb-4">Tests</h1>
        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3 py-2 mb-3">{error}</p>}

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : tests.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No tests available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {tests.map((t) => (
              <div key={t.public_id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-semibold text-slate-900">{t.title}</p>
                  {t.has_attempted && <span className="text-[10px] font-semibold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">Attempted</span>}
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1 mb-3">
                  <Clock className="w-3 h-3" /> {t.duration_minutes} min • {t.total_marks} marks
                </p>
                <button
                  onClick={() => handleStart(t.public_id)}
                  className="bg-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-xl"
                >
                  {t.has_attempted ? "Retake" : "Start Test"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
