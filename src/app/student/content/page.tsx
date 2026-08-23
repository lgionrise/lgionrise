// src/app/student/content/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download } from "lucide-react";

interface ContentItem {
  public_id: string;
  title: string;
  content_type: string;
  file_url: string;
  batch_title?: string;
}

const TYPE_LABELS: Record<string, string> = {
  notes: "Notes", dpp: "DPP", assignment: "Assignment", solution_sheet: "Solution",
  formula_sheet: "Formula Sheet", pyq: "Previous Year", sample_paper: "Sample Paper",
};

export default function StudentContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [filterType, setFilterType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setIsLoading(true);
    const params = filterType ? `?content_type=${filterType}` : "";
    fetch(`/api/student/content${params}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) { setError(d.error || "Could not load study material."); return; }
        setItems(d.results || []);
      })
      .finally(() => setIsLoading(false));
  }, [filterType]);

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="student" />
      <div className="w-full max-w-2xl mx-auto px-4 pt-24 pb-24 lg:pb-8 overflow-x-hidden">
        <h1 className="text-lg font-bold text-slate-900 mb-4">Study Material</h1>

        <div className="flex gap-2 mb-4 overflow-x-auto -mx-4 px-4 snap-x">
          <button onClick={() => setFilterType("")}
            className={`shrink-0 snap-start text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${!filterType ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
            All
          </button>
          {Object.entries(TYPE_LABELS).map(([value, label]) => (
            <button key={value} onClick={() => setFilterType(value)}
              className={`shrink-0 snap-start text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${filterType === value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
              {label}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 rounded-xl px-3.5 py-2.5 mb-4 break-words">{error}</p>}

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No study material uploaded yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              
                key={item.public_id} href={item.file_url} target="_blank" rel="noopener noreferrer"
                className="bg-white rounded-2xl p-3.5 shadow-sm flex items-center gap-3 min-w-0"
              >
                <div className="bg-indigo-50 p-2.5 rounded-xl shrink-0">
                  <FileText className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-slate-500">{TYPE_LABELS[item.content_type] || item.content_type}{item.batch_title ? ` • ${item.batch_title}` : ""}</p>
                </div>
                <Download className="w-4 h-4 text-slate-400 shrink-0" />
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
