// src/app/teacher/support/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { SupportTicket } from "@/types/support";
import { cn, formatDateTime } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [form, setForm] = useState({ category: "technical", priority: "medium", subject: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTickets = () => {
    fetch("/api/teacher/support/tickets").then((r) => r.json()).then((data) => setTickets(data.results || []));
  };

  useEffect(() => { loadTickets(); }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await fetch("/api/teacher/support/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ category: "technical", priority: "medium", subject: "", description: "" });
    setShowNewTicket(false);
    setIsSubmitting(false);
    loadTickets();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Support</h1>
        <div className="flex gap-3">
          <Link href="/teacher/support/help-center" className="text-sm font-medium text-indigo-600">Help Center</Link>
          <button onClick={() => setShowNewTicket(!showNewTicket)} className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
            New Ticket
          </button>
        </div>
      </div>

      {showNewTicket && (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="payment">Payment</option>
              <option value="technical">Technical</option>
              <option value="content">Content</option>
              <option value="account">Account</option>
            </select>
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
          <input required placeholder="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          <textarea required rows={3} placeholder="Describe the issue..." value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          <button type="submit" disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Submit Ticket
          </button>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
        {tickets.map((t) => (
          <Link key={t.public_id} href={`/teacher/support/tickets/${t.public_id}`} className="flex items-center justify-between px-5 py-4 hover:bg-slate-50">
            <div>
              <p className="text-sm font-medium">{t.subject}</p>
              <p className="text-xs text-slate-500">{formatDateTime(t.created_at)}</p>
            </div>
            <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full capitalize",
              t.status === "resolved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
              {t.status}
            </span>
          </Link>
        ))}
        {tickets.length === 0 && <p className="text-sm text-slate-500 p-4">No support tickets yet.</p>}
      </div>
    </div>
  );
}
