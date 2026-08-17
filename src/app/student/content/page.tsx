// src/app/student/content/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download } from "lucide-react";

interface ContentItem { public_id: string; title: string; content_type: string; file_url: string }

export default function StudentContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/content").then((r) => r.json()).then((d) => setItems(d.results || [])).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="student" />
      <div className="pt-24 px-4 pb-5">
        <h1 className="text-lg font-bold text-slate-900 mb-4">Study Material</h1>
        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No material uploaded yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <a key={item.public_id} href={item.file_url} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                <div className="bg-indigo-50 p-2 rounded-xl"><FileText className="w-4 h-4 text-indigo-600" /></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-slate-500 capitalize">{item.content_type.replace("_", " ")}</p>
                </div>
                <Download className="w-4 h-4 text-slate-400" />
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
