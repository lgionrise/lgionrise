// src/components/teacher/batch-reviews-tab.tsx
"use client";

import { useState, useEffect } from "react";
import { BatchReview } from "@/types/batch";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

export function BatchReviewsTab({ batchSlug }: { batchSlug: string }) {
  const [reviews, setReviews] = useState < BatchReview[] > ([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    fetch(`/api/teacher/batches/${batchSlug}/reviews`)
      .then((r) => r.json())
      .then((data) => setReviews(data.results || []))
      .finally(() => setIsLoading(false));
  }, [batchSlug]);
  
  if (isLoading) return <p className="text-slate-500 text-sm">Loading reviews...</p>;
  if (reviews.length === 0) return <p className="text-slate-500 text-sm">No reviews yet.</p>;
  
  return (
    <div className="max-w-xl space-y-3">
      {reviews.map((review) => (
        <div key={review.public_id} className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{review.student_name}</span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
              ))}
            </div>
          </div>
          {review.comment && <p className="text-sm text-slate-600 mt-2">{review.comment}</p>}
          <p className="text-xs text-slate-400 mt-2">{formatDate(review.created_at)}</p>
        </div>
      ))}
    </div>
  );
}