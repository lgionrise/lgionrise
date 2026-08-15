// src/components/landing/public-batch-card.tsx
import Link from "next/link";
import Image from "next/image";
import { Star, Users } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface PublicBatch {
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

export function PublicBatchCard({ batch }: { batch: PublicBatch }) {
  const hasThumbnail = Boolean(batch.thumbnail_url);

  return (
    <Link href={`/batches/${batch.slug}`} className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="relative aspect-video">
        {hasThumbnail ? (
          <Image src={batch.thumbnail_url} alt={batch.title} fill className="object-cover" />
        ) : (
          // Fallback when no banner/thumbnail is set — batch name + course
          // shown clearly instead of a broken/empty image box.
          <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-violet-600 flex flex-col items-center justify-center text-white p-4 text-center">
            <span className="text-xs font-medium uppercase tracking-wide text-white/70 mb-1">{batch.course.category}</span>
            <h3 className="font-bold text-lg leading-snug">{batch.title}</h3>
          </div>
        )}
      </div>

      <div className="p-4">
        {hasThumbnail && (
          <>
            <span className="text-xs font-medium text-indigo-600 uppercase">{batch.course.category}</span>
            <h3 className="font-semibold text-slate-900 mt-1 line-clamp-2">{batch.title}</h3>
          </>
        )}
        <p className="text-sm text-slate-500 mt-1">{batch.primary_teacher.full_name}</p>

        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-slate-900">{formatCurrency(batch.effective_price)}</span>
          <div className="flex items-center gap-3 text-xs text-slate-500">
            {batch.average_rating && (
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {batch.average_rating.toFixed(1)}
              </span>
            )}
            {batch.seats_available !== null && (
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {batch.seats_available} left</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
