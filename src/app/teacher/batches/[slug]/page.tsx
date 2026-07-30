// src/app/teacher/batches/[slug]/page.tsx
import { notFound } from "next/navigation";
import { djangoFetch } from "@/lib/django-api";
import { BatchDetailTabs } from "@/components/teacher/batch-detail-tabs";

async function getBatch(slug: string) {
  const res = await djangoFetch(`/batches/${slug}/manage/`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load batch");
  return res.json();
}

export default async function BatchDetailPage({ params }: { params: Promise < { slug: string } > }) {
  const { slug } = await params;
  const batch = await getBatch(slug);
  if (!batch) notFound();
  
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-1">{batch.title}</h1>
      <p className="text-sm text-slate-500 mb-6">{batch.status} • {batch.language}</p>
      <BatchDetailTabs batch={batch} />
    </div>
  );
}