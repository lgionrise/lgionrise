// src/app/student/batches/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { Star } from "lucide-react";

interface BrowseBatch {
  public_id: string;
  title: string;
  slug: string;
  course: { title: string; category: string };
  thumbnail_url: string;
  effective_price: string;
  average_rating: number | null;
  seats_available: number | null;
}

export default function StudentBrowseBatchesPage() {
  const [batches, setBatches] = useState<BrowseBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/batches").then((r) => r.json()).then((data) => setBatches(data.results || [])).finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Browse Batches</h1>
      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map((b) => (
            <Link key={b.public_id} href={`/student/batches/${b.slug}`} className="border border-slate-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow">
              <div className="relative aspect-video bg-slate-100">
                {b.thumbnail_url && <Image src={b.thumbnail_url} alt={b.title} fill className="object-cover" />}
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-indigo-600 uppercase">{b.course.category}</span>
                <h3 className="font-semibold text-slate-900 mt-1 line-clamp-2">{b.title}</h3>
                <div className="flex items-center justify-between mt-3">
                  <span className="font-semibold">{formatCurrency(b.effective_price)}</span>
                  {b.average_rating && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {b.average_rating.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
