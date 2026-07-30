// src/app/teacher/tests/question-bank/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { Question, QuestionType, QuestionOption } from "@/types/test";
import { getErrorMessage } from "@/lib/utils";
import { Plus, Loader2 } from "lucide-react";

const QUESTION_TYPES: { value: QuestionType; label: string }[] = [
  { value: "mcq_single", label: "MCQ (Single Correct)" },
  { value: "mcq_multiple", label: "MCQ (Multiple Correct)" },
  { value: "numeric", label: "Numeric Answer" },
  { value: "integer", label: "Integer Answer" },
  { value: "matrix_match", label: "Matrix Match" },
];

export default function QuestionBankPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    question_type: "mcq_single" as QuestionType,
    difficulty: "medium",
    question_text: "",
    default_marks: 4,
  });
  const [options, setOptions] = useState<QuestionOption[]>([{ id: "a", text: "" }, { id: "b", text: "" }]);
  const [correctOptionIds, setCorrectOptionIds] = useState<string[]>([]);
  const [numericMin, setNumericMin] = useState("");
  const [numericMax, setNumericMax] = useState("");
  const [integerValue, setIntegerValue] = useState("");

  const loadQuestions = () => {
    fetch("/api/teacher/tests/question-bank")
      .then((r) => r.json())
      .then((data) => setQuestions(data.results || []))
      .finally(() => setIsLoading(false));
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

    const payload = {
      ...form,
      options: form.question_type.startsWith("mcq") ? options : [],
      correct_answer: buildCorrectAnswer(),
    };

    const res = await fetch("/api/teacher/tests/question-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
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
    if (form.question_type === "mcq_single") {
      setCorrectOptionIds([optionId]);
    } else {
      setCorrectOptionIds((prev) => prev.includes(optionId) ? prev.filter((id) => id !== optionId) : [...prev, optionId]);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Question Bank</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Question
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Question Type</label>
              <select
                value={form.question_type}
                onChange={(e) => { setForm({ ...form, question_type: e.target.value as QuestionType }); setCorrectOptionIds([]); }}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
              >
                {QUESTION_TYPES.map((qt) => <option key={qt.value} value={qt.value}>{qt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Difficulty</label>
              <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Question Text</label>
            <textarea rows={3} required value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>

          {(form.question_type === "mcq_single" || form.question_type === "mcq_multiple") && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Options (tick the correct {form.question_type === "mcq_single" ? "answer" : "answers"})
              </label>
              <div className="space-y-2">
                {options.map((opt, i) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <input
                      type={form.question_type === "mcq_single" ? "radio" : "checkbox"}
                      checked={correctOptionIds.includes(opt.id)}
                      onChange={() => toggleCorrect(opt.id)}
                    />
                    <input
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...options]; updated[i] = { ...opt, text: e.target.value }; setOptions(updated);
                      }}
                      placeholder={`Option ${opt.id.toUpperCase()}`}
                      className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setOptions([...options, { id: String.fromCharCode(97 + options.length), text: "" }])}
                className="text-xs text-indigo-600 font-medium mt-2"
              >
                + Add Option
              </button>
            </div>
          )}

          {form.question_type === "numeric" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Min Correct Value</label>
                <input type="number" value={numericMin} onChange={(e) => setNumericMin(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Correct Value</label>
                <input type="number" value={numericMax} onChange={(e) => setNumericMax(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
              </div>
            </div>
          )}

          {form.question_type === "integer" && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Correct Integer Value</label>
              <input type="number" value={integerValue} onChange={(e) => setIntegerValue(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
            </div>
          )}

          {form.question_type === "matrix_match" && (
            <p className="text-sm text-slate-500 bg-slate-50 rounded-lg p-3">
              Matrix-match pairing UI can be added as a follow-up — for now this question type saves with an empty match set.
            </p>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Default Marks</label>
            <input type="number" value={form.default_marks} onChange={(e) => setForm({ ...form, default_marks: parseFloat(e.target.value) })}
              className="w-32 px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

          <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg text-sm">
            Save Question
          </button>
        </form>
      )}

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {questions.map((q) => (
            <div key={q.public_id} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full capitalize">{q.question_type.replace("_", " ")}</span>
                <span className="text-xs font-medium bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full capitalize">{q.difficulty}</span>
                <span className="text-xs text-slate-400">{q.default_marks} marks</span>
              </div>
              <p className="text-sm text-slate-900">{q.question_text}</p>
            </div>
          ))}
          {questions.length === 0 && <p className="text-sm text-slate-500 p-4">No questions in the bank yet.</p>}
        </div>
      )}
    </div>
  );
}