// src/app/teacher/batches/create/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Course } from "@/types/batch";
import { Loader2 } from "lucide-react";
import { ThumbnailUpload } from "@/components/ui/thumbnail-upload";

export default function CreateBatchPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", course: "", description: "", language: "hinglish", status: "draft",
    price: "", discounted_price: "", validity_start: "", validity_end: "", max_students: "",thumbnail_url: "",
  });

  useEffect(() => {
    fetch("/api/courses").then((r) => r.json()).then((data) => setCourses(data.results || []));
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const payload = {
      ...form,
      discounted_price: form.discounted_price || null,
      max_students: form.max_students ? parseInt(form.max_students) : null,
    };

    const res = await fetch("/api/teacher/batches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    // src/app/teacher/batches/create/page.tsx — handleSubmit ke andar ye part update karo
    if (!res.ok) {
      setError(data.error || "Failed to create batch.");
      setIsLoading(false);
      return;
    }

    if (!data.slug) {
      setError("Batch created, but couldn't load its page. Please check My Batches list.");
      setIsLoading(false);
      return;
    }

    router.push(`/teacher/batches/${data.slug}`);
    router.refresh();
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Create Batch</h1>

      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <ThumbnailUpload
            currentUrl={form.thumbnail_url}
            onUploaded={(url) => setForm({ ...form, thumbnail_url: url })}
          />
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
          <input
            required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Course</label>
          <select
            required value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select a course</option>
            {courses.map((c) => (
              <option key={c.public_id} value={c.public_id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Price (₹)</label>
            <input
              required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Discounted Price (optional)</label>
            <input
              type="number" value={form.discounted_price} onChange={(e) => setForm({ ...form, discounted_price: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Validity Start</label>
            <input
              required type="date" value={form.validity_start} onChange={(e) => setForm({ ...form, validity_start: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Validity End</label>
            <input
              required type="date" value={form.validity_end} onChange={(e) => setForm({ ...form, validity_end: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Language</label>
            <select
              value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="hi">Hindi</option>
              <option value="en">English</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Max Students (optional)</label>
            <input
              type="number" value={form.max_students} onChange={(e) => setForm({ ...form, max_students: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
          <select
            value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit" disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm flex items-center gap-2"
        >
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Batch
        </button>
      </form>
    </div>
  );
}
