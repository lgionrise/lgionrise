// src/app/teacher/batches/page.tsx
import Link from "next/link";
import Image from "next/image";
import { djangoFetch } from "@/lib/django-api";
import { Batch } from "@/types/batch";
import { PaginatedResponse } from "@/types/teacher";
import { formatCurrency } from "@/lib/utils";
import { Plus, Star, Users } from "lucide-react";

async function getBatches(): Promise < PaginatedResponse < Batch >> {
  const res = await djangoFetch("/batches/mine/");
  if (!res.ok) return { count: 0, total_pages: 0, current_page: 1, next: null, previous: null, results: [] };
  return res.json();
}

const statusStyles: Record < string, string > = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
  archived: "bg-amber-100 text-amber-700",
};

export default async function BatchesPage() {
  const data = await getBatches();
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My Batches</h1>
          <p className="text-sm text-slate-500 mt-0.5">{data.count} batches</p>
        </div>
        <Link
          href="/teacher/batches/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Create Batch
        </Link>
      </div>

      {data.results.length === 0 ? (
        <p className="text-slate-500 text-center py-16">No batches yet. Create your first one.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.results.map((batch) => (
            <Link
              key={batch.public_id}
              href={`/teacher/batches/${batch.slug}`}
              className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white"
            >
              <div className="relative aspect-video bg-slate-100">
                {batch.thumbnail_url && <Image src={batch.thumbnail_url} alt={batch.title} fill className="object-cover" />}
                <span className={`absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full ${statusStyles[batch.status]}`}>
                  {batch.status}
                </span>
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-indigo-600 uppercase">{batch.course.category}</span>
                <h3 className="font-semibold text-slate-900 mt-1 line-clamp-2">{batch.title}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-semibold text-slate-900">{formatCurrency(batch.effective_price)}</span>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    {batch.average_rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {batch.average_rating.toFixed(1)}
                      </span>
                    )}
                    {batch.seats_available !== null && (
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" /> {batch.seats_available} left
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}