// src/app/student/page.tsx
"use client";

import { useState, useEffect } from "react";
import { EnrolledBatch, StudentLiveClass } from "@/types/student";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { ThumbnailCard } from "@/components/ui/thumbnail-card";
import { QuickActionButton } from "@/components/ui/quick-action-button";
import { formatDateTime } from "@/lib/utils";
import { StudentUser } from "@/lib/current-student";
import { BookOpen, PlayCircle, ClipboardList, HelpCircle, Wallet, Video } from "lucide-react";

export default function StudentDashboardPage() {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [enrollments, setEnrollments] = useState<EnrolledBatch[]>([]);
  const [liveClass, setLiveClass] = useState<StudentLiveClass | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch("/api/student/enrollments").then((r) => r.json()),
      fetch("/api/student/live-classes").then((r) => r.json()),
    ]).then(([meData, enrollData, classData]) => {
      setUser(meData.user);
      setEnrollments(enrollData.results || []);
      const live = (classData.results || []).find((c: StudentLiveClass) => c.status === "live");
      setLiveClass(live || null);
    }).finally(() => setIsLoading(false));
  }, []);

  if (isLoading || !user) return <p className="text-slate-500 text-sm p-5">Loading...</p>;

  return (
    <div>
      <MobileTopBar firstName={user.first_name} lastName={user.last_name} role="student" />

      <div className="px-4 pt-24 lg:pt-6 pb-5">
        {liveClass && (
          <a
            href={`/student/live-classes/${liveClass.public_id}/watch`}
            className="flex items-center gap-3 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-2xl p-4 mb-6 shadow-sm active:scale-[0.98] transition-transform"
          >
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Video className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium opacity-90">🔴 Live Now</p>
              <p className="font-semibold text-sm">{liveClass.title}</p>
            </div>
          </a>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
          <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h2>
          <div className="flex gap-4 overflow-x-auto pb-1">
            <QuickActionButton label="Browse Batches" icon={BookOpen} color="indigo" href="/student/batches" />
            <QuickActionButton label="Recordings" icon={PlayCircle} color="teal" href="/student/recordings" />
            <QuickActionButton label="Tests" icon={ClipboardList} color="amber" href="/student/tests" />
            <QuickActionButton label="Doubts" icon={HelpCircle} color="rose" href="/student/doubts" />
            <QuickActionButton label="Payments" icon={Wallet} color="sky" href="/student/payments" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-slate-900">Browse Batches</h2>
          <a href="/student/batches" className="text-xs font-medium text-indigo-600">See all</a>
        </div>

        {enrollments.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
            <p className="text-slate-500 text-sm mb-3">You&apos;re not enrolled in any batch yet.</p>
            <a href="/student/browse" className="text-indigo-600 font-medium text-sm">Browse batches →</a>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {enrollments.map((e) => (
              <ThumbnailCard
                key={e.public_id}
                href={`/student/batches/${e.batch.slug}`}
                title={e.batch.title}
                thumbnailUrl={e.batch.thumbnail_url}
                categoryLabel={e.batch.course.category}
                statusBadge={e.is_active ? { label: "Active", color: "green" } : { label: "Expired", color: "slate" }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
