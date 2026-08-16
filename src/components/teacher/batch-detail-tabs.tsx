// src/components/teacher/batch-detail-tabs.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { BatchOverviewTab } from "./batch-overview-tab";
import { BatchScheduleTab } from "./batch-schedule-tab";
import { BatchReviewsTab } from "./batch-reviews-tab";
import { BatchStudentsTab } from "./batch-students-tab";

const tabs = ["Overview", "Weekly Schedule", "Reviews", "Enrolled Students", "Videos"] as const;

export function BatchDetailTabs({ batch }: { batch: any }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");

  return (
    <div>
      <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
        {tabs.map((tab) =>
          tab === "Videos" ? (
            <Link
              key={tab}
              href={`/teacher/batches/${batch.slug}/recordings`}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              Videos
            </Link>
          ) : (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                activeTab === tab
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              )}
            >
              {tab}
            </button>
          )
        )}
      </div>

      {activeTab === "Overview" && <BatchOverviewTab batch={batch} />}
      {activeTab === "Weekly Schedule" && <BatchScheduleTab batchSlug={batch.slug} />}
      {activeTab === "Reviews" && <BatchReviewsTab batchSlug={batch.slug} />}
      {activeTab === "Enrolled Students" && <BatchStudentsTab batchSlug={batch.slug} />}
    </div>
  );
}
