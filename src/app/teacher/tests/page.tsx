// src/app/teacher/tests/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { TestManage } from "@/types/test";
import { ClipboardList, Plus, BookOpen } from "lucide-react";

export default function TestsPage() {
  const [tests, setTests] = useState<TestManage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/tests").then((r) => r.json()).then((d) => setTests(d.results || [])).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="teacher" />
      <div className="w-full max-w-3xl mx-auto px-4 pt-24 pb-24 lg:pb-8 overflow-x-hidden">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-900">My Tests</h1>
          <Link href="/teacher/tests/question-bank" className="text-xs font-semibold text-indigo-600 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" /> Question Bank
          </Link>
        </div>

        <Link href="/teacher/tests/create" className="flex items-center justify-center gap-2 bg-indigo-600 text-white text-sm font-semibold py-3 rounded-xl mb-5 w-full">
          <Plus className="w-4 h-4" /> Create Test
        </Link>

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : (
          <div className="space-y-2">
            {tests.map((test) => (
              <Link key={test.public_id} href={`/teacher/tests/${test.public_id}`} className="flex items-center justify-between bg-white rounded-2xl p-3.5 shadow-sm gap-2 min-w-0">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="bg-indigo-50 p-2 rounded-xl shrink-0"><ClipboardList className="w-4 h-4 text-indigo-600" /></div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{test.title}</p>
                    <p className="text-xs text-slate-500">{test.duration_minutes} min • {test.total_marks} marks</p>
                  </div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${test.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {test.is_published ? "Published" : "Draft"}
                </span>
              </Link>
            ))}
            {tests.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No tests created yet.</p>}
          </div>
        )}
      </div>
    </>
  );
}
