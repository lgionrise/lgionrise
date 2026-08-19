// src/app/teacher/tests/[publicId]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Question, TestResults } from "@/types/test";
import { cn } from "@/lib/utils";

export default function TestDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const [activeTab, setActiveTab] = useState<"Questions" | "Results">("Questions");
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [attachedIds, setAttachedIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<TestResults | null>(null);

  useEffect(() => {
    fetch("/api/teacher/tests/question-bank").then((r) => r.json()).then((d) => setBankQuestions(d.results || []));
    fetch(`/api/teacher/tests/${publicId}/questions`).then((r) => r.json()).then((d) => {
      setAttachedIds(new Set((d.results || []).map((tq: { question: string }) => tq.question)));
    });
  }, [publicId]);

  useEffect(() => {
    if (activeTab === "Results") fetch(`/api/teacher/tests/${publicId}/results`).then((r) => r.json()).then(setResults);
  }, [activeTab, publicId]);

  const attachQuestion = async (questionId: string, order: number) => {
    await fetch(`/api/teacher/tests/${publicId}/questions`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ question: questionId, order }),
    });
    setAttachedIds((prev) => new Set(prev).add(questionId));
  };

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="teacher" />
      <div className="w-full max-w-2xl mx-auto px-4 pt-24 pb-24 lg:pb-8 overflow-x-hidden">
        <div className="flex gap-1 mb-4 bg-slate-100 rounded-xl p-1 w-full">
          {(["Questions", "Results"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={cn("flex-1 py-2 rounded-lg text-sm font-medium", activeTab === tab ? "bg-white shadow-sm text-indigo-600" : "text-slate-500")}>
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Questions" && (
          <div className="space-y-2">
            {bankQuestions.map((q, i) => (
              <div key={q.public_id} className="bg-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-2 min-w-0">
                <p className="text-sm flex-1 min-w-0 truncate">{q.question_text}</p>
                {attachedIds.has(q.public_id) ? (
                  <span className="text-xs font-semibold text-emerald-600 shrink-0">Added</span>
                ) : (
                  <button onClick={() => attachQuestion(q.public_id, i)} className="text-xs font-semibold text-indigo-600 shrink-0">+ Add</button>
                )}
              </div>
            ))}
            {bankQuestions.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No questions in the bank.</p>}
          </div>
        )}

        {activeTab === "Results" && results && (
          <div>
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm">
                <p className="text-[10px] text-slate-500">Avg Score</p>
                <p className="text-base font-bold">{results.stats.avg_score?.toFixed(1) ?? "—"}</p>
              </div>
              <div className="bg-white rounded-2xl p-3.5 text-center shadow-sm">
                <p className="text-[10px] text-slate-500">Attempts</p>
                <p className="text-base font-bold">{results.stats.total_attempts}</p>
              </div>
            </div>
            <div className="space-y-2">
              {results.attempts.map((a) => (
                <div key={a.public_id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center justify-between text-sm">
                  <span>Attempt #{a.attempt_number}</span>
                  <span className="text-slate-500">{a.total_score ?? "—"} marks</span>
                </div>
              ))}
              {results.attempts.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No attempts yet.</p>}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
