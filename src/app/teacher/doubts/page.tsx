// src/app/teacher/doubts/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { DoubtListItem } from "@/types/doubt";
import { cn, formatDateTime } from "@/lib/utils";
import { HelpCircle, MessageCircleQuestion } from "lucide-react";

const statusColor: Record<string, string> = {
  open: "bg-amber-100 text-amber-700",
  answered: "bg-indigo-100 text-indigo-700",
  resolved: "bg-emerald-100 text-emerald-700",
  reopened: "bg-rose-100 text-rose-700",
};

export default function TeacherDoubtsPage() {
  const [doubts, setDoubts] = useState<DoubtListItem[]>([]);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    fetch(`/api/teacher/doubts${filter ? `?status=${filter}` : ""}`)
      .then((r) => r.json()).then((d) => setDoubts(d.results || [])).finally(() => setIsLoading(false));
  }, [filter]);

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="teacher" />
      <div className="pt-24 px-4 pb-5">
        <h1 className="text-lg font-bold text-slate-900 mb-3">Doubts</h1>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {["", "open", "answered", "resolved", "reopened"].map((s) => (
            <button key={s} onClick={() => setFilter(s)}
              className={cn("text-xs font-semibold px-3.5 py-1.5 rounded-full whitespace-nowrap capitalize",
                filter === s ? "bg-indigo-600 text-white" : "bg-white text-slate-600 shadow-sm")}>
              {s || "All"}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : doubts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <MessageCircleQuestion className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No doubts here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {doubts.map((d) => (
              <Link key={d.public_id} href={`/teacher/doubts/${d.public_id}`} className="block bg-white rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900 truncate">{d.student_name}</p>
                  </div>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0", statusColor[d.status])}>
                    {d.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 pl-10">{d.text_content}</p>
                <p className="text-[10px] text-slate-400 mt-1 pl-10">{formatDateTime(d.created_at)} • {d.reply_count} replies</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
