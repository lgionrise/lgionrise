// src/app/student/help/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { HelpCircle, ChevronDown, LifeBuoy } from "lucide-react";

interface FAQ { public_id: string; question: string; answer: string }

export default function TeacherHelpPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/faqs").then((r) => r.json()).then((d) => setFaqs(d.results || [])).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="student" />
      <div className="w-full max-w-2xl mx-auto px-4 pt-24 pb-24 lg:pb-8 overflow-x-hidden">
        <h1 className="text-lg font-bold text-slate-900 mb-4">Help & FAQs</h1>

        <Link href="/teacher/support" className="flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm mb-5">
          <div className="bg-indigo-50 p-2.5 rounded-xl"><LifeBuoy className="w-5 h-5 text-indigo-600" /></div>
          <div>
            <p className="text-sm font-semibold">Need more help?</p>
            <p className="text-xs text-slate-500">Contact support or raise a ticket</p>
          </div>
        </Link>

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : faqs.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No FAQs published yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {faqs.map((f) => (
              <div key={f.public_id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === f.public_id ? null : f.public_id)}
                  className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                >
                  <span className="text-sm font-medium pr-2">{f.question}</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${openId === f.public_id ? "rotate-180" : ""}`} />
                </button>
                {openId === f.public_id && (
                  <p className="px-4 pb-4 text-sm text-slate-500 break-words">{f.answer}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
