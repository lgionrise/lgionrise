// src/components/teacher/manage-teachers-client.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TeacherListItem } from "@/types/manage-teachers";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { Plus } from "lucide-react";

export function ManageTeachersClient() {
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [filter, setFilter] = useState<"" | "pending" | "approved">("");
  const [isLoading, setIsLoading] = useState(true);

  const loadTeachers = () => {
    const params = filter === "pending" ? "?is_approved=false" : filter === "approved" ? "?is_approved=true" : "";
    fetch(`/api/teacher/manage-teachers${params}`)
      .then((r) => r.json())
      .then((data) => setTeachers(data.results || []))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadTeachers(); }, [filter]);

  const handleApprove = async (publicId: string) => {
    await fetch(`/api/teacher/manage-teachers/${publicId}/approve`, { method: "POST" });
    loadTeachers();
  };

  const handleRevoke = async (publicId: string) => {
    await fetch(`/api/teacher/manage-teachers/${publicId}/revoke-approval`, { method: "POST" });
    loadTeachers();
  };

  const handleSuspendToggle = async (publicId: string) => {
    await fetch(`/api/teacher/manage-teachers/${publicId}/suspend`, { method: "POST" });
    loadTeachers();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Manage Teachers</h1>
        <Link
          href="/teacher/manage-teachers/add"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Teacher
        </Link>
      </div>

      <div className="flex gap-2 mb-4">
        {(["", "pending", "approved"] as const).map((f) => (
          <button
            key={f} onClick={() => setFilter(f)}
            className={cn("text-xs font-medium px-3 py-1.5 rounded-full capitalize",
              filter === f ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}
          >
            {f || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {teachers.map((t) => (
            <div key={t.public_id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                  {getInitials(t.first_name, t.last_name)}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.first_name} {t.last_name}</p>
                  <p className="text-xs text-slate-500">{t.email} • Joined {formatDate(t.date_joined)}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
                  t.is_approved ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                  {t.is_approved ? "Approved" : "Pending"}
                </span>
                {t.is_suspended && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">Suspended</span>
                )}

                {!t.is_approved ? (
                  <button onClick={() => handleApprove(t.public_id)} className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                    Approve
                  </button>
                ) : (
                  <button onClick={() => handleRevoke(t.public_id)} className="text-xs font-medium text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg">
                    Revoke
                  </button>
                )}
                <button onClick={() => handleSuspendToggle(t.public_id)} className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                  {t.is_suspended ? "Reactivate" : "Suspend"}
                </button>
              </div>
            </div>
          ))}
          {teachers.length === 0 && <p className="text-sm text-slate-500 p-4">No teachers found.</p>}
        </div>
      )}
    </div>
  );
}
