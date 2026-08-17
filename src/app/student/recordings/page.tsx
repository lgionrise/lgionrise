// src/app/student/recordings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { PlayCircle } from "lucide-react";

interface Recording { public_id: string; title: string; thumbnail_url: string; batch_title: string }

export default function StudentRecordingsPage() {
  const [items, setItems] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/recordings").then((r) => r.json()).then((d) => setItems(d.results || [])).finally(() => setIsLoading(false));
  }, []);

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="student" />
      <div className="pt-24 px-4 pb-5 w-full overflow-x-hidden">
        <h1 className="text-lg font-bold text-slate-900 mb-4">Recordings</h1>
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-video w-full" />)}</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <PlayCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No recordings yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((r) => (
              <a key={r.public_id} href={`/student/recordings/${r.public_id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="relative aspect-video bg-slate-100">
                  {r.thumbnail_url && <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" />}
                </div>
                <div className="p-2.5">
                  <p className="text-sm font-medium line-clamp-1">{r.title}</p>
                  <p className="text-xs text-slate-500 line-clamp-1">{r.batch_title}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
