// src/app/student/batches/page.tsx — poori file replace karo
"use client";

import { useState, useEffect } from "react";
import { ThumbnailCard } from "@/components/ui/thumbnail-card";

interface BrowseBatch {
  public_id: string;
  title: string;
  slug: string;
  course: { title: string; category: string };
  primary_teacher: { full_name: string; profile_photo: string | null };
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
    <div className="p-5">
      <h1 className="text-lg font-bold text-slate-900 mb-5">Browse Batches</h1>
      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {batches.map((b) => (
            <ThumbnailCard
              key={b.public_id}
              href={`/student/batches/${b.slug}`}
              title={b.title}
              thumbnailUrl={b.thumbnail_url}
              categoryLabel={b.course.category}
              teacherName={b.primary_teacher.full_name}
              teacherPhoto={b.primary_teacher.profile_photo}
              price={b.effective_price}
              rating={b.average_rating}
              seatsLeft={b.seats_available}
            />
          ))}
        </div>
      )}
    </div>
  );
}
