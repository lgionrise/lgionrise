// src/app/teacher/batches/[slug]/recordings/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { PlayCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Recording { public_id: string; title: string; thumbnail_url: string; duration_seconds: number }

export default function BatchPlaylistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/teacher/batches/${slug}/recordings`) => r.json()).then((d) => setRecordings(d.results || [])).finally(() => setIsLoading(false));
  }, [slug]);

  return (
    <div className="p-5">
      <h1 className="text-lg font-bold text-slate-900 mb-4">Video Library</h1>
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-video w-full" />)}</div>
      ) : recordings.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
          <PlayCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500">No videos yet for this batch</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {recordings.map((r) => (
            <a key={r.public_id} href={`/student/recordings/${r.public_id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="relative aspect-video bg-slate-100">
                {r.thumbnail_url && <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" />}
              </div>
              <p className="text-sm font-medium p-2.5 line-clamp-1">{r.title}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
