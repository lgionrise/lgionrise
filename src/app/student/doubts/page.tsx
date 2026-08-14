// src/app/student/doubts/page.tsx — poori file replace karo
"use client";

import { useState, useEffect, FormEvent } from "react";
import Link from "next/link";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { cn, formatDateTime } from "@/lib/utils";
import { Plus, HelpCircle, X, ImagePlus, Loader2 } from "lucide-react";

interface Doubt { public_id: string; text_content: string; status: string; reply_count: number; created_at: string }
interface EnrolledBatch { batch: { public_id: string; title: string } }

const statusColor: Record<string, string> = {
  open: "bg-amber-100 text-amber-700", answered: "bg-indigo-100 text-indigo-700",
  resolved: "bg-emerald-100 text-emerald-700", reopened: "bg-rose-100 text-rose-700",
};

export default function StudentDoubtsPage() {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [batches, setBatches] = useState<EnrolledBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [text, setText] = useState("");
  const [selectedBatch, setSelectedBatch] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = () => {
    fetch("/api/student/doubts").then((r) => r.json()).then((d) => setDoubts(d.results || [])).finally(() => setIsLoading(false));
  };
  useEffect(() => {
    load();
    fetch("/api/student/enrollments").then((r) => r.json()).then((d) => setBatches(d.results || []));
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true); setError("");
    try {
      const url = await uploadToCloudinary(file, "doubt-attachments");
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAsk = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !imageUrl) { setError("Add a question or a photo."); return; }
    if (!selectedBatch) { setError("Select which batch this doubt is about."); return; }

    setIsSubmitting(true); setError("");
    const res = await fetch("/api/student/doubts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ batch: selectedBatch, source_type: "general", text_content: text, image_url: imageUrl, priority: "normal" }),
    });
    const data = await res.json();
    setIsSubmitting(false);

    if (!res.ok) { setError(data.error || "Failed to submit doubt."); return; }
    setText(""); setImageUrl(""); setSelectedBatch(""); setShowForm(false);
    load();
  };

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="student" />
      <div className="pt-24 px-4 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-900">My Doubts</h1>
          <button onClick={() => setShowForm(true)} className="bg-indigo-600 text-white p-2.5 rounded-full shadow-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAsk} className="bg-white rounded-2xl p-4 shadow-sm mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold">Ask a Doubt</p>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>

            <select
              value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} required
              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 mb-2"
            >
              <option value="">Select batch</option>
              {batches.map((e) => <option key={e.batch.public_id} value={e.batch.public_id}>{e.batch.title}</option>)}
            </select>

            <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Type your question..." className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />

            <div className="mt-2">
              {imageUrl ? (
                <div className="relative w-24 h-24">
                  <img src={imageUrl} alt="Attached" className="w-full h-full object-cover rounded-xl" />
                  <button type="button" onClick={() => setImageUrl("")} className="absolute -top-1.5 -right-1.5 bg-slate-900 text-white rounded-full p-1">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 cursor-pointer">
                  {isUploadingImage ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
                  {isUploadingImage ? "Uploading..." : "Attach a photo"}
                  <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" disabled={isUploadingImage} />
                </label>
              )}
            </div>

            {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

            <button type="submit" disabled={isSubmitting || isUploadingImage}
              className="mt-3 bg-indigo-600 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl">
              Submit
            </button>
          </form>
        )}

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : doubts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">Ask your first doubt</p>
          </div>
        ) : (
          <div className="space-y-2">
            {doubts.map((d) => (
              <Link key={d.public_id} href={`/student/doubts/${d.public_id}`} className="block bg-white rounded-2xl p-3.5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm text-slate-900 line-clamp-1 flex-1">{d.text_content || "📷 Photo attached"}</p>
                  <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0", statusColor[d.status])}>{d.status}</span>
                </div>
                <p className="text-[10px] text-slate-400">{formatDateTime(d.created_at)} • {d.reply_count} replies</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
