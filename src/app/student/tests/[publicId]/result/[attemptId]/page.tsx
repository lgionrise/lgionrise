// src/app/student/tests/[publicId]/result/[attemptId]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { formatDateTime } from "@/lib/utils";
import { Trophy } from "lucide-react";

interface Result {
  total_score: number; accuracy_percent: number; rank_in_batch: number | null; percentile: number | null;
  responses: { question_text: string; is_correct: boolean | null; marks_awarded: number }[];
}

export default function TestResultPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    fetch(`/api/student/tests/attempts/${attemptId}/result`).then((r) => r.json()).then(setResult);
  }, [attemptId]);

  if (!result) return <p className="p-5 text-sm text-slate-500">Evaluating your test...</p>;

  return (
    <div className="p-5 pb-10">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-center text-white mb-5">
        <Trophy className="w-10 h-10 mx-auto mb-2" />
        <p className="text-3xl font-bold">{result.total_score}</p>
        <p className="text-sm text-white/80">Total Score</p>
        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div><p className="font-bold">{result.accuracy_percent?.toFixed(0)}%</p><p className="text-white/70 text-xs">Accuracy</p></div>
          {result.rank_in_batch && <div><p className="font-bold">#{result.rank_in_batch}</p><p className="text-white/70 text-xs">Rank</p></div>}
        </div>
      </div>

      <h2 className="text-sm font-semibold text-slate-900 mb-2">Answer Review</h2>
      <div className="space-y-2">
        {result.responses.map((r, i) => (
          <div key={i} className="bg-white rounded-xl p-3 shadow-sm flex items-center justify-between">
            <p className="text-sm line-clamp-1 flex-1">{r.question_text}</p>
            <span className={`text-xs font-semibold ${r.is_correct ? "text-emerald-600" : "text-red-500"}`}>
              {r.marks_awarded > 0 ? "+" : ""}{r.marks_awarded}
            </span>
          </div>
        ))}
      </div>

      <Link href="/student/tests" className="block text-center bg-indigo-600 text-white font-semibold py-3 rounded-xl mt-5">
        Back to Tests
      </Link>
    </div>
  );
}
