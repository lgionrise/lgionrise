// src/app/student/batches/[slug]/library/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { PlayCircle, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Recording { public_id: string; title: string; thumbnail_url: string }
interface Note { public_id: string; title: string; content_type: string; file_url: string }

export default function BatchLibraryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/student/batches/${slug}/recordings`).then((r) => r.json()),
      fetch(`/api/student/content?batch__slug=${slug}`).then((r) => r.json()),
    ]).then(([recData, contentData]) => {
      setRecordings(recData.results || []);
      setNotes(contentData.results || []);
    }).finally(() => setIsLoading(false));
  }, [slug]);

  return (
    <div className="p-4 pt-24">
      <h1 className="text-lg font-bold text-slate-900 mb-4">Class Library</h1>

      {isLoading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <>
          <h2 className="text-sm font-semibold text-slate-700 mb-2">Recorded Videos</h2>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {recordings.map((r) => (
              <a key={r.public_id} href={`/student/recordings/${r.public_id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="relative aspect-video bg-slate-100">
                  {r.thumbnail_url && <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" />}
                  <PlayCircle className="absolute inset-0 m-auto w-6 h-6 text-white drop-shadow" />
                </div>
                <p className="text-xs font-medium p-2 line-clamp-1">{r.title}</p>
              </a>
            ))}
            {recordings.length === 0 && <p className="text-xs text-slate-400 col-span-2">No recordings yet.</p>}
          </div>

          <h2 className="text-sm font-semibold text-slate-700 mb-2">Notes & PDFs</h2>
          <div className="space-y-2">
            {notes.map((n) => (
              <a key={n.public_id} href={n.file_url} target="_blank" rel="noopener noreferrer" className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
                <span className="text-sm truncate">{n.title}</span>
              </a>
            ))}
            {notes.length === 0 && <p className="text-xs text-slate-400">No notes uploaded yet.</p>}
          </div>
        </>
      )}
    </div>
  );
}
