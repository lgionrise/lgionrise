// src/app/teacher/content/page.tsx
"use client";

import { useState, useEffect, useRef, ChangeEvent } from "react";
import { ContentItem, CONTENT_TYPES } from "@/types/content";
import { Batch } from "@/types/batch";
import { getErrorMessage } from "@/lib/utils";
import { Upload, FileText, Loader2, Trash2 } from "lucide-react";

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ContentPage() {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [filterType, setFilterType] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploadForm, setUploadForm] = useState({
    batch: "", content_type: "notes", title: "", allow_download: true,
  });

  const loadContent = () => {
    const params = filterType ? `?content_type=${filterType}` : "";
    fetch(`/api/teacher/content${params}`)
      .then((r) => r.json())
      .then((data) => setItems(data.results || []))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadContent();
    fetch("/api/teacher/batches").then((r) => r.json()).then((data) => setBatches(data.results || []));
  }, [filterType]);

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !uploadForm.batch || !uploadForm.title) {
      setError("Select a batch and enter a title before choosing a file.");
      return;
    }
    setError(""); setIsUploading(true);

    const formData = new FormData();
    formData.append("batch", uploadForm.batch);
    formData.append("content_type", uploadForm.content_type);
    formData.append("title", uploadForm.title);
    formData.append("allow_download", String(uploadForm.allow_download));
    formData.append("file", file);

    const res = await fetch("/api/teacher/content", { method: "POST", body: formData });
    const data = await res.json();

    if (!res.ok) {
      setError(getErrorMessage(data.error) || "Upload failed.");
    } else {
      setUploadForm({ ...uploadForm, title: "" });
      loadContent();
    }
    setIsUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (publicId: string) => {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/teacher/content/${publicId}`, { method: "DELETE" });
    loadContent();
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Study Material</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-5 mb-6">
        <h2 className="text-sm font-medium text-slate-700 mb-3">Upload New File</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <select
            value={uploadForm.batch} onChange={(e) => setUploadForm({ ...uploadForm, batch: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            <option value="">Select batch</option>
            {batches.map((b) => <option key={b.public_id} value={b.public_id}>{b.title}</option>)}
          </select>
          <select
            value={uploadForm.content_type} onChange={(e) => setUploadForm({ ...uploadForm, content_type: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          >
            {CONTENT_TYPES.map((ct) => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
          </select>
          <input
            placeholder="Title" value={uploadForm.title} onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
        <label className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer">
          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {isUploading ? "Uploading..." : "Choose File & Upload"}
          <input ref={fileInputRef} type="file" onChange={handleFileSelect} disabled={isUploading} className="hidden" />
        </label>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        <button onClick={() => setFilterType("")} className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${!filterType ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}>
          All
        </button>
        {CONTENT_TYPES.map((ct) => (
          <button
            key={ct.value} onClick={() => setFilterType(ct.value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${filterType === ct.value ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
          >
            {ct.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {items.map((item) => (
            <div key={item.public_id} className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded-lg"><FileText className="w-4 h-4 text-slate-500" /></div>
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-slate-500">
                    {item.chapter_title || "No chapter"} • {formatFileSize(item.file_size_bytes)} • {item.download_count} downloads
                  </p>
                </div>
              </div>
              <button onClick={() => handleDelete(item.public_id)} className="text-slate-400 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && <p className="text-sm text-slate-500 p-4">No files uploaded yet.</p>}
        </div>
      )}
    </div>
  );
}