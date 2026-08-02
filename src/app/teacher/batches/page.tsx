// src/app/teacher/batches/page.tsx — poori file replace karo
import Link from "next/link";
import { djangoFetch } from "@/lib/django-api";
import { Batch } from "@/types/batch";
import { PaginatedResponse } from "@/types/teacher";
import { ThumbnailCard } from "@/components/ui/thumbnail-card";
import { Plus } from "lucide-react";

async function getBatches(): Promise<PaginatedResponse<Batch>> {
  const res = await djangoFetch("/batches/mine/");
  if (!res.ok) return { count: 0, total_pages: 0, current_page: 1, next: null, previous: null, results: [] };
  return res.json();
}

const statusColor = { draft: "slate", published: "green", archived: "amber" } as const;

export default async function BatchesPage() {
  const data = await getBatches();

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold text-slate-900">My Batches</h1>
          <p className="text-xs text-slate-500">{data.count} batches</p>
        </div>
        <Link href="/teacher/batches/create" className="bg-indigo-600 text-white p-3 rounded-2xl shadow-sm shadow-indigo-200">
          <Plus className="w-5 h-5" />
        </Link>
      </div>

      {data.results.length === 0 ? (
        <p className="text-slate-500 text-center py-16 text-sm">No batches yet. Create your first one.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {data.results.map((batch) => (
            <ThumbnailCard
              key={batch.public_id}
              href={`/teacher/batches/${batch.slug}`}
              title={batch.title}
              thumbnailUrl={batch.thumbnail_url}
              categoryLabel={batch.course.category}
              price={batch.effective_price}
              rating={batch.average_rating}
              seatsLeft={batch.seats_available}
              statusBadge={{ label: batch.status, color: statusColor[batch.status] }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
