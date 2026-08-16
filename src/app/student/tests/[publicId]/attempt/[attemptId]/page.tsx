// src/app/student/tests/[publicId]/attempt/[attemptId]/page.tsx
"use client";

import { useState, useEffect, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

interface Question { public_id: string; order: number; question: { public_id: string; question_type: string; question_text: string; options: { id: string; text: string }[]; marks: number } }
interface TestDetail { title: string; duration_minutes: number; questions: Question[] }

export default function TestAttemptPage({ params }: { params: Promise<{ publicId: string; attemptId: string }> }) {
  const { publicId, attemptId } = use(params);
  const router = useRouter();
  const [test, setTest] = useState<TestDetail | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/student/tests/${publicId}/questions`).then((r) => r.json()).then((d) => {
      setTest(d);
      setSecondsLeft(d.duration_minutes * 60);
    });
  }, [publicId]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    await fetch(`/api/student/tests/attempts/${attemptId}/submit`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_auto: false }),
    });
    router.push(`/student/tests/${publicId}/result/${attemptId}`);
  }, [attemptId, publicId, router, isSubmitting]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) { handleSubmit(); return 0; }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, handleSubmit]);

  const selectAnswer = async (testQuestionId: string, value: any) => {
    setAnswers((prev) => ({ ...prev, [testQuestionId]: value }));
    await fetch(`/api/student/tests/attempts/${attemptId}/answer`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ test_question_id: testQuestionId, selected_answer: value, mark_status: "answered" }),
    });
  };

  if (!test) return <p className="p-5 text-sm text-slate-500">Loading...</p>;

  const q = test.questions[current];
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="sticky top-0 bg-white shadow-sm px-4 py-3 flex items-center justify-between z-10">
        <p className="text-sm font-semibold">{test.title}</p>
        <span className="text-sm font-mono font-bold text-red-600">{mins}:{secs.toString().padStart(2, "0")}</span>
      </div>

      <div className="p-4">
        <p className="text-xs text-slate-500 mb-2">Question {current + 1} of {test.questions.length} • {q.question.marks} marks</p>
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
          <p className="text-sm font-medium text-slate-900 mb-4">{q.question.question_text}</p>

          {(q.question.question_type === "mcq_single" || q.question.question_type === "mcq_multiple") && (
            <div className="space-y-2">
              {q.question.options.map((opt) => {
                const isMultiple = q.question.question_type === "mcq_multiple";
                const current = answers[q.public_id];
                const isSelected = isMultiple ? (current?.option_ids || []).includes(opt.id) : current?.option_id === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      if (isMultiple) {
                        const prevIds: string[] = answers[q.public_id]?.option_ids || [];
                        const newIds = prevIds.includes(opt.id) ? prevIds.filter((i) => i !== opt.id) : [...prevIds, opt.id];
                        selectAnswer(q.public_id, { option_ids: newIds });
                      } else {
                        selectAnswer(q.public_id, { option_id: opt.id });
                      }
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm border-2 ${isSelected ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white"}`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
          )}

          {(q.question.question_type === "numeric" || q.question.question_type === "integer") && (
            <input
              type="number"
              onChange={(e) => selectAnswer(q.public_id, q.question.question_type === "integer" ? parseInt(e.target.value) : parseFloat(e.target.value))}
              placeholder="Your answer"
              className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm bg-slate-50"
            />
          )}
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {test.questions.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)}
              className={`w-8 h-8 rounded-lg text-xs font-semibold ${i === current ? "bg-indigo-600 text-white" : answers[test.questions[i].public_id] ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
              {i + 1}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          {current > 0 && (
            <button onClick={() => setCurrent(current - 1)} className="flex-1 bg-slate-100 text-slate-700 text-sm font-semibold py-3 rounded-xl">
              Previous
            </button>
          )}
          {current < test.questions.length - 1 ? (
            <button onClick={() => setCurrent(current + 1)} className="flex-1 bg-indigo-600 text-white text-sm font-semibold py-3 rounded-xl">
              Next
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isSubmitting} className="flex-1 bg-emerald-600 text-white text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Submit Test
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
