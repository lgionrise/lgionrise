// src/app/teacher/support/tickets/[public_id]/page.tsx
"use client";

import { useState, useEffect, use, FormEvent } from "react";
import { TicketMessage } from "@/types/support";
import { formatDateTime } from "@/lib/utils";
import { Send } from "lucide-react";

export default function TicketThreadPage({ params }: { params: Promise<{ public_id: string }> }) {
  const { public_id } = use(params);
  const [ticket, setTicket] = useState<{ subject: string; status: string; messages: TicketMessage[] } | null>(null);
  const [text, setText] = useState("");

  const load = () => {
    fetch(`/api/teacher/support/tickets/${public_id}`).then((r) => r.json()).then(setTicket);
  };

  useEffect(() => { load(); }, [public_id]);

  const handleSend = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    await fetch(`/api/teacher/support/tickets/${public_id}/message`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    setText("");
    load();
  };

  if (!ticket) return <p className="text-slate-500 text-sm">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <h1 className="text-lg font-semibold text-slate-900 mb-4">{ticket.subject}</h1>
      <div className="space-y-3 mb-4">
        {ticket.messages.map((m) => (
          <div key={m.public_id} className="bg-white border border-slate-200 rounded-xl p-3 text-sm">
            <p className="font-medium text-xs text-slate-500 mb-1">{m.sender_name}</p>
            <p>{m.content}</p>
            <p className="text-xs text-slate-400 mt-1">{formatDateTime(m.created_at)}</p>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..."
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm" />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-lg"><Send className="w-4 h-4" /></button>
      </form>
    </div>
  );
}
