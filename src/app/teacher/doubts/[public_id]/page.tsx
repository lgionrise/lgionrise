// src/app/teacher/doubts/[public_id]/page.tsx
"use client";

import { useState, useEffect, use, FormEvent } from "react";
import { DoubtDetail } from "@/types/doubt";
import { cn, formatDateTime } from "@/lib/utils";
import { Send, CheckCircle } from "lucide-react";

export default function DoubtThreadPage({ params }: { params: Promise<{ public_id: string }> }) {
  const { public_id } = use(params);
  const [doubt, setDoubt] = useState<DoubtDetail | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const load = () => {
    fetch(`/api/teacher/doubts/${public_id}`).then((r) => r.json()).then(setDoubt);
  };

  useEffect(() => { load(); }, [public_id]);

  const handleReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setIsSending(true);
    await fetch(`/api/teacher/doubts/${public_id}/reply`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text_content: replyText, image_url: "", video_url: "" }),
    });
    setReplyText("");
    setIsSending(false);
    load();
  };

  const handleResolve = async () => {
    await fetch(`/api/teacher/doubts/${public_id}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolved: true }),
    });
    load();
  };

  if (!doubt) return <p className="text-slate-500 text-sm">Loading...</p>;

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-slate-900">Doubt Thread</h1>
        {doubt.status !== "resolved" && (
          <button onClick={handleResolve} className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700">
            <CheckCircle className="w-4 h-4" /> Mark Resolved
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
        <p className="text-sm">{doubt.text_content}</p>
        {doubt.image_url && <img src={doubt.image_url} alt="Doubt attachment" className="mt-3 rounded-lg max-h-64" />}
      </div>

      <div className="space-y-3 mb-4">
        {doubt.replies.map((reply) => (
          <div key={reply.public_id} className={cn("flex", reply.is_from_teacher ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
              reply.is_from_teacher ? "bg-indigo-600 text-white" : "bg-white border border-slate-200"
            )}>
              <p>{reply.text_content}</p>
              <p className={cn("text-xs mt-1", reply.is_from_teacher ? "text-indigo-200" : "text-slate-400")}>
                {formatDateTime(reply.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleReply} className="flex gap-2">
        <input
          value={replyText} onChange={(e) => setReplyText(e.target.value)}
          placeholder="Type your reply..."
          className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm"
        />
        <button type="submit" disabled={isSending} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white p-2.5 rounded-lg">
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}