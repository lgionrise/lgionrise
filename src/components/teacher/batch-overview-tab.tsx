// src/components/teacher/batch-overview-tab.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Copy, Trash2 } from "lucide-react";

export function BatchOverviewTab({ batch }: { batch: any }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title: batch.title, description: batch.description || "", price: batch.price,
    discounted_price: batch.discounted_price || "", status: batch.status,
    allow_downloads: batch.allow_downloads, is_featured: batch.is_featured,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setMessage(""); setIsSaving(true);

    const res = await fetch(`/api/teacher/batches/${batch.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, discounted_price: form.discounted_price || null }),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error || "Failed to save."); setIsSaving(false); return; }
    setMessage("Changes saved.");
    setIsSaving(false);
    router.refresh();
  };

  const handleClone = async () => {
    const res = await fetch(`/api/teacher/batches/${batch.slug}/clone`, { method: "POST" });
    const data = await res.json();
    if (res.ok) router.push(`/teacher/batches/${data.slug}`);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this batch? This cannot be undone.")) return;
    const res = await fetch(`/api/teacher/batches/${batch.slug}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) { setError(data.error || "Cannot delete this batch."); return; }
    router.push("/teacher/batches");
  };

  return (
    <div className="max-w-xl">
      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹)</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Discounted Price</label>
            <input type="number" value={form.discounted_price} onChange={(e) => setForm({ ...form, discounted_price: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm">
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        {message && <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{message}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-5 py-2.5 rounded-lg text-sm flex items-center gap-2">
            {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
          <button type="button" onClick={handleClone}
            className="border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium px-4 py-2.5 rounded-lg text-sm flex items-center gap-2">
            <Copy className="w-4 h-4" /> Clone
          </button>
          <button type="button" onClick={handleDelete}
            className="text-red-600 hover:bg-red-50 font-medium px-4 py-2.5 rounded-lg text-sm flex items-center gap-2 ml-auto">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </form>
    </div>
  );
}