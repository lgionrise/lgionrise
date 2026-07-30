// src/app/teacher/tests/[publicId]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { Question, TestResults } from "@/types/test";
import { cn, formatDateTime } from "@/lib/utils";

export default function TestDetailPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const [activeTab, setActiveTab] = useState<"Questions" | "Results">("Questions");
  const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
  const [attachedIds, setAttachedIds] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<TestResults | null>(null);

  useEffect(() => {
    fetch("/api/teacher/tests/question-bank").then((r) => r.json()).then((data) => setBankQuestions(data.results || []));
    fetch(`/api/teacher/tests/${publicId}/questions`).then((r) => r.json()).then((data) => {
      setAttachedIds(new Set((data.results || []).map((tq: { question: string }) => tq.question)));
    });
  }, [publicId]);

  useEffect(() => {
    if (activeTab === "Results") {
      fetch(`/api/teacher/tests/${publicId}/results`).then((r) => r.json()).then(setResults);
    }
  }, [activeTab, publicId]);

  const attachQuestion = async (questionId: string, order: number) => {
    await fetch(`/api/teacher/tests/${publicId}/questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: questionId, order }),
    });
    setAttachedIds((prev) => new Set(prev).add(questionId));
  };

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {(["Questions", "Results"] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn("px-4 py-2.5 text-sm font-medium border-b-2 -mb-px",
              activeTab === tab ? "border-indigo-600 text-indigo-600" : "border-transparent text-slate-500")}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Questions" && (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {bankQuestions.map((q, i) => (
            <div key={q.public_id} className="flex items-center justify-between px-4 py-3">
              <p className="text-sm flex-1 pr-4">{q.question_text}</p>
              {attachedIds.has(q.public_id) ? (
                <span className="text-xs font-medium text-emerald-600">Added</span>
              ) : (
                <button onClick={() => attachQuestion(q.public_id, i)} className="text-xs font-medium text-indigo-600 whitespace-nowrap">
                  + Add to test
                </button>
              )}
            </div>
          ))}
          {bankQuestions.length === 0 && <p className="text-sm text-slate-500 p-4">No questions in the bank — add some first.</p>}
        </div>
      )}

      {activeTab === "Results" && results && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500">Avg Score</p>
              <p className="text-lg font-semibold">{results.stats.avg_score?.toFixed(1) ?? "—"}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500">Max Score</p>
              <p className="text-lg font-semibold">{results.stats.max_score ?? "—"}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500">Min Score</p>
              <p className="text-lg font-semibold">{results.stats.min_score ?? "—"}</p>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500">Attempts</p>
              <p className="text-lg font-semibold">{results.stats.total_attempts}</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {results.attempts.map((a) => (
              <div key={a.public_id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>Attempt #{a.attempt_number}</span>
                <span className="text-slate-500">{a.total_score ?? "—"} marks • {a.accuracy_percent?.toFixed(0) ?? "—"}%</span>
              </div>
            ))}
            {results.attempts.length === 0 && <p className="text-sm text-slate-500 p-4">No attempts yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}