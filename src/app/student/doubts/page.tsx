// src/app/student/doubts/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDateTime } from "@/lib/utils";
import { Plus, HelpCircle, X } from "lucide-react";

interface Doubt { public_id: string; text_content: string; status: string; reply_count: number; created_at: string }

const statusColor: Record<string, string> = {
  open: "bg-amber-100 text-amber-700", answered: "bg-indigo-100 text-indigo-700",
  resolved: "bg-emerald-100 text-emerald-700", reopened: "bg-rose-100 text-rose-700",
};

export default function StudentDoubtsPage() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    fetch("/api/student/doubts").then((r) => r.json()).then((d) => setDoubts(d.results || [])).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAsk = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSubmitting(true);
    await fetch("/api/student/doubts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ source_type: "general", text_content: text, priority: "normal" }),
    });
    setText(""); setShowForm(false); setIsSubmitting(false);
    load();
  };

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="student" />
      <div className="pt-24 px-4 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-900">My Doubts</h1>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white p-2.5 rounded-full shadow-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAsk} className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Ask a Doubt</p>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <textarea required rows={3} value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Type your question..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />
            <button type="submit" disabled={isSubmitting} className="mt-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
              Submit
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : doubts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Ask your first doubt</p>
          </div>
        ) : (
          <div className="space-y-2">
            {doubts.map((d) => (
              <Link key={d.public_id} href={`/student/doubts/${d.public_id}`} className="block bg-white rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm text-slate-900 line-clamp-1 flex-1">{d.text_content}</p>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0", statusColor[d.status])}>{d.status}</span>
                </div>
                <p className="text-[10px] text-slate-400">{formatDateTime(d.created_at)} • {d.reply_count} replies</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
