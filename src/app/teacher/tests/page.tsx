// src/app/teacher/tests/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TestManage } from "@/types/test";
import { Plus, ClipboardList } from "lucide-react";

export default function TestsPage() {
  const [tests, setTests] = useState<TestManage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/tests").then((r) => r.json()).then((data) => setTests(data.results || [])).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">My Tests</h1>
        <div className="flex gap-2">
          <Link href="/teacher/tests/question-bank" className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2.5 rounded-lg">
            Question Bank
          </Link>
          <Link href="/teacher/tests/create" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> Create Test
          </Link>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {tests.map((test) => (
            <Link key={test.public_id} href={`/teacher/tests/${test.public_id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-lg"><ClipboardList className="w-4 h-4 text-indigo-600" /></div>
                <div>
                  <p className="font-medium text-sm">{test.title}</p>
                  <p className="text-xs text-slate-500">{test.duration_minutes} min • {test.total_marks} marks</p>
                </div>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${test.is_published ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {test.is_published ? "Published" : "Draft"}
              </span>
            </Link>
          ))}
          {tests.length === 0 && <p className="text-sm text-slate-500 p-4">No tests created yet.</p>}
        </div>
      )}
    </div>
  );
}