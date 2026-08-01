// src/app/student/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { EnrolledBatch } from "@/types/student";
import { formatDate } from "@/lib/utils";

export default function StudentDashboardPage() {
  const [enrollments, setEnrollments] = useState<EnrolledBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/student/enrollments")
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) { setError(data.error || "Could not load your batches."); return; }
        setEnrollments(data.results || []);
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">My Batches</h1>
        <Link href="/student/live-classes" className="text-sm font-medium text-indigo-600">
          Upcoming Live Classes →
        </Link>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">{error}</p>}

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : enrollments.length === 0 ? (
        <p className="text-slate-500 text-center py-16">
          You&apos;re not enrolled in any batch yet. <Link href="/batches" className="text-indigo-600 font-medium">Browse batches</Link>
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {enrollments.map((e) => (
            <div key={e.public_id} className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="relative aspect-video bg-slate-100">
                {e.batch.thumbnail_url && <Image src={e.batch.thumbnail_url} alt={e.batch.title} fill className="object-cover" />}
              </div>
              <div className="p-4">
                <span className="text-xs font-medium text-indigo-600 uppercase">{e.batch.course.category}</span>
                <h3 className="font-semibold text-slate-900 mt-1">{e.batch.title}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {e.is_active ? `Valid until ${formatDate(e.expires_at)}` : "Access expired"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
