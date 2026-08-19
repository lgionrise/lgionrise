// src/app/teacher/tests/question-bank/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Question, QuestionType, QuestionOption } from "@/types/test";
import { getErrorMessage } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "mcq_single", label: "MCQ (Single)" },
  { value: "mcq_multiple", label: "MCQ (Multiple)" },
  { value: "numeric", label: "Numeric" },
  { value: "integer", label: "Integer" },
  { value: "matrix_match", label: "Matrix Match" },
];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    question_type: "mcq_single" as QuestionType, difficulty: "medium", question_text: "", default_marks: 4,
  });
  const [options, setOptions] = useState<QuestionOption[]>([{ id: "a", text: "" }, { id: "b", text: "" }]);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([]);
  const [numericMin, setNumericMin] = useState("");
  const [numericMax, setNumericMax] = useState("");
  const [integerValue, setIntegerValue] = useState("");

  const loadQuestions = () => {
    fetch("/api/teacher/tests/question-bank").then((r) => r.json()).then((d) => setQuestions(d.results || [])).finally(() => setIsLoading(false));
  };
  useEffect(() => { loadQuestions(); }, []);

  const buildCorrectAnswer = (): Record<string, unknown> => {
    if (form.question_type === "mcq_single") return { option_id: correctOptionIds[0] || "" };
    if (form.question_type === "mcq_multiple") return { option_ids: correctOptionIds };
    if (form.question_type === "numeric") return { min: parseFloat(numericMin), max: parseFloat(numericMax) };
    if (form.question_type === "integer") return { value: parseInt(integerValue) };
    return {};
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    const payload = { ...form, options: form.question_type.startsWith("mcq") ? options : [], correct_answer: buildCorrectAnswer() };
    const res = await fetch("/api/teacher/tests/question-bank", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) { setError(getErrorMessage(data.error) || "Failed to create question."); return; }
    setShowForm(false);
    setForm({ question_type: "mcq_single", difficulty: "medium", question_text: "", default_marks: 4 });
    setOptions([{ id: "a", text: "" }, { id: "b", text: "" }]);
    setCorrectOptionIds([]);
    loadQuestions();
  };

  const toggleCorrect = (optionId: string) => {
    if (form.question_type === "mcq_single") setCorrectOptionIds([optionId]);
    else setCorrectOptionIds((prev) => prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]);
  };

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="teacher" />
      <div className="w-full max-w-2xl mx-auto px-4 pt-24 pb-24 lg:pb-8 overflow-x-hidden">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-900">Question Bank</h1>
          <button onClick={() => setShowForm(!showForm)} className="bg-indigo-600 text-white p-2.5 rounded-full shadow-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 mb-5 w-full">
            <select value={form.question_type}
              onChange={(e) => { setForm({ ...form, question_type: e.target.value as QuestionType }); setCorrectOptionIds([]); }}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50">
              {QUESTION_TYPES.map((qt) => <option key={qt.value} value={qt.value}>{qt.label}</option>)}
            </select>
            <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50">
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
            <textarea rows={3} required value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              placeholder="Question text" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />

            {(form.question_type === "mcq_single" || form.question_type === "mcq_multiple") && (
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input type={form.question_type === "mcq_single" ? "radio" : "checkbox"}
                      checked={correctOptionIds.includes(opt.id)} onChange={() => toggleCorrect(opt.id)} className="shrink-0" />
                    <input value={opt.text}
                      onChange={(e) => { const upd = [...options]; upd[i] = { ...opt, text: e.target.value }; setOptions(upd); }}
                      placeholder={`Option ${opt.id.toUpperCase()}`}
                      className="flex-1 min-w-0 px-3 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50" />
                  </div>
                ))}
                <button type="button" onClick={() => setOptions([...options, { id: String.fromCharCode(97 + options.length), text: "" }])}
                  className="text-xs text-indigo-600 font-semibold">+ Add Option</button>
              </div>
            )}

            {form.question_type === "numeric" && (
              <div className="grid grid-cols-2 gap-2">
                <input type="number" value={numericMin} onChange={(e) => setNumericMin(e.target.value)} placeholder="Min"
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />
                <input type="number" value={numericMax} onChange={(e) => setNumericMax(e.target.value)} placeholder="Max"
                  className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />
              </div>
            )}
            {form.question_type === "integer" && (
              <input type="number" value={integerValue} onChange={(e) => setIntegerValue(e.target.value)} placeholder="Correct value"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />
            )}

            <input type="number" value={form.default_marks} onChange={(e) => setForm({ ...form, default_marks: parseFloat(e.target.value) })}
              placeholder="Marks" className="w-24 px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />

            {error && <p className="text-sm text-red-600 break-words">{error}</p>}
            <button type="submit" className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-xl text-sm">Save Question</button>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : (
          <div className="space-y-2">
            {questions.map((q) => (
              <div key={q.public_id} className="bg-white rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{q.question_type.replace("_", " ")}</span>
                  <span className="text-[10px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full capitalize">{q.difficulty}</span>
                </div>
                <p className="text-sm text-slate-900 break-words">{q.question_text}</p>
              </div>
            ))}
            {questions.length === 0 && <p className="text-sm text-slate-500 text-center py-8">No questions yet.</p>}
          </div>
        )}
      </div>
    </>
  );
}
