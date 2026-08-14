// src/app/student/doubts/[public_id]/page.tsx
"use client";

import { useState, useEffect, use, FormEvent } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { cn, formatDateTime } from "@/lib/utils";
import { Send } from "lucide-react";

interface Reply { public_id: string; sender_name: string; text_content: string; is_from_teacher: boolean; created_at: string }
interface DoubtDetail { text_content: string; image_url: string; status: string; replies: Reply[] }

export default function StudentDoubtThreadPage({ params }: { params: Promise<{ public_id: string }> }) {
  const { public_id } = use(params);
  const [doubt, setDoubt] = useState<DoubtDetail | null>(null);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const load = () => fetch(`/api/student/doubts/${public_id}`).then((r) => r.json()).then(setDoubt);
  useEffect(() => { load(); }, [public_id]);

  const handleReply = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setIsSending(true);
    await fetch(`/api/student/doubts/${public_id}/reply`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text_content: text, image_url: "", video_url: "" }),
    });
    setText(""); setIsSending(false); load();
  };

  if (!doubt) return <><MobileTopBar firstName="" lastName="" role="student" /><p className="pt-24 px-4 text-sm text-slate-500">Loading...</p></>;

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="student" />
      <div className="pt-24 px-4 pb-24">
        <div className="bg-white rounded-2xl p-4 shadow-sm mb-3">
          {doubt.text_content && <p className="text-sm">{doubt.text_content}</p>}
          {doubt.image_url && <img src={doubt.image_url} alt="Doubt" className="mt-2 rounded-xl max-h-64 w-full object-cover" />}
        </div>

        <div className="space-y-2 mb-4">
          {doubt.replies.map((r) => (
            <div key={r.public_id} className={cn("flex", r.is_from_teacher ? "justify-start" : "justify-end")}>
              <div className={cn("max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                r.is_from_teacher ? "bg-white shadow-sm" : "bg-indigo-600 text-white")}>
                {r.is_from_teacher && <p className="text-[10px] font-semibold text-indigo-600 mb-0.5">{r.sender_name}</p>}
                <p>{r.text_content}</p>
                <p className={cn("text-[10px] mt-1", r.is_from_teacher ? "text-slate-400" : "text-indigo-200")}>
                  {formatDateTime(r.created_at)}
                </p>
              </div>
            </div>
          ))}
        </div>

        <form onSubmit={handleReply} className="fixed bottom-16 left-0 right-0 lg:left-64 px-4 max-w-5xl mx-auto flex gap-2">
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..."
            className="flex-1 px-4 py-3 rounded-xl bg-white shadow-md text-sm border border-slate-200" />
          <button type="submit" disabled={isSending} className="bg-indigo-600 text-white p-3 rounded-xl shadow-md">
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
