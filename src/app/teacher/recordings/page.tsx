// src/app/teacher/recordings/page.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { Upload, PlayCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Recording { public_id: string; title: string; status: string; thumbnail_url: string; duration_seconds: number; is_published: boolean }
interface Batch { public_id: string; title: string }

const statusColor: Record<string, string> = {
  uploading: "bg-amber-100 text-amber-700", processing: "bg-indigo-100 text-indigo-700",
  ready: "bg-emerald-100 text-emerald-700", failed: "bg-red-100 text-red-700",
};

export default function TeacherRecordingsPage() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [selectedBatch, setSelectedBatch] = useState("");
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [provider, setProvider] = useState<"youtube" | "cloudflare">("youtube");
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    fetch("/api/teacher/recordings").then((r) => r.json()).then((d) => setRecordings(d.results || [])).finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
    fetch("/api/teacher/batches").then((r) => r.json()).then((d) => setBatches(d.results || []));

    // Poll every 8s while any recording is still processing — auto-updates
    // status from UPLOADING/PROCESSING to READY/FAILED without a refresh.
    const interval = setInterval(load, 8000);
    return () => clearInterval(interval);
  }, []);

   const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedBatch || !title.trim()) { setError("Select a batch and enter a title before choosing a video."); return; }
    setError(""); setIsUploading(true);

    if (provider === "youtube") {
      const formData = new FormData();
      formData.append("batch", selectedBatch);
      formData.append("title", title);
      formData.append("file", file);
      const res = await fetch("/api/teacher/recordings/upload", { method: "POST", body: formData });
      const data = await res.json();
      setIsUploading(false);
      if (!res.ok) { setError(data.error || "Upload failed."); return; }
    } else {
      // Cloudflare Stream: get a direct-upload URL, then PUT the file straight to Cloudflare
      const initRes = await fetch("/api/teacher/recordings/upload-cloudflare/initiate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: selectedBatch, title }),
      });
      const initData = await initRes.json();
      if (!initRes.ok) { setError(initData.error || "Could not start upload."); setIsUploading(false); return; }

      const uploadForm = new FormData();
      uploadForm.append("file", file);
      const putRes = await fetch(initData.upload_url, { method: "POST", body: uploadForm });
      setIsUploading(false);
      if (!putRes.ok) { setError("Upload to Cloudflare failed."); return; }
    }

    setTitle(""); setSelectedBatch("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    load();
  };
  return (
    <>
      <MobileTopBar firstName="" lastName="" role="teacher" />
      <div className="pt-24 px-4 pb-5">
        <h1 className="text-lg font-bold text-slate-900 mb-4">Recordings</h1>

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-5">
          <p className="text-sm font-semibold mb-3">Upload New Recording</p>
          <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 mb-2">
            <option value="">Select batch</option>
            {batches.map((b) => <option key={b.public_id} value={b.public_id}>{b.title}</option>)}
          </select>
          <div className="flex gap-2 mb-3">
  <button type="button" onClick={() => setProvider("youtube")}
    className={`flex-1 text-xs font-semibold py-2 rounded-xl ${provider === "youtube" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
    YouTube
  </button>
  <button type="button" onClick={() => setProvider("cloudflare")}
    className={`flex-1 text-xs font-semibold py-2 rounded-xl ${provider === "cloudflare" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
    Cloudflare Stream
  </button>
</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Recording title"
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 mb-3" />

          {error && <p className="text-xs text-red-600 mb-2">{error}</p>}

          <label className="inline-flex items-center gap-2 bg-indigo-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl cursor-pointer">
            {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            {isUploading ? "Uploading..." : "Choose Video File"}
            <input ref={fileInputRef} type="file" accept="video/*" onChange={handleUpload} disabled={isUploading} className="hidden" />
          </label>
          <p className="text-[11px] text-slate-400 mt-2">Video is uploaded as unlisted to YouTube — this may take a few minutes for longer classes.</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-video w-full" />)}</div>
        ) : recordings.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <PlayCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No recordings uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recordings.map((r) => (
              <div key={r.public_id} className="bg-white rounded-2xl overflow-hidden shadow-sm">
                <div className="relative aspect-video bg-slate-100">
                  {r.thumbnail_url ? (
                    <img src={r.thumbnail_url} alt={r.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Loader2 className="w-5 h-5 text-slate-300 animate-spin" /></div>
                  )}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium line-clamp-1">{r.title}</p>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize mt-1 inline-block", statusColor[r.status])}>
                    {r.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
