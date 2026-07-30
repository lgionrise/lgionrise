// src/app/teacher/live-classes/[publicId]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { LiveClassDetail, AttendanceRecord } from "@/types/live-class";
import { formatDateTime } from "@/lib/utils";
import { Video, X } from "lucide-react";

export default function ClassDetailPage({ params }: { params: Promise < { publicId: string } > }) {
  const { publicId } = use(params);
  const router = useRouter();
  const [detail, setDetail] = useState < LiveClassDetail | null > (null);
  const [attendance, setAttendance] = useState < AttendanceRecord[] > ([]);
  const [showCancelForm, setShowCancelForm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  
  const load = () => {
    fetch(`/api/teacher/live-classes/${publicId}`).then((r) => r.json()).then(setDetail);
  };
  
  useEffect(() => {
    load();
    fetch(`/api/teacher/live-classes/${publicId}/attendance`)
      .then((r) => r.json())
      .then((data) => setAttendance(data.results || []));
  }, [publicId]);
  
  const handleCancel = async () => {
    await fetch(`/api/teacher/live-classes/${publicId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: cancelReason }),
    });
    load();
    setShowCancelForm(false);
  };
  
  if (!detail) return <p className="text-slate-500 text-sm">Loading...</p>;
  
  const canStart = detail.status === "scheduled" || detail.status === "live";
  const isEnded = detail.status === "ended" || detail.status === "cancelled";
  
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-1">{detail.title}</h1>
      <p className="text-sm text-slate-500 mb-6">{formatDateTime(detail.scheduled_start)} — {formatDateTime(detail.scheduled_end)}</p>

      {canStart && !showCancelForm && (
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.push(`/teacher/live-classes/${publicId}/host`)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Video className="w-4 h-4" /> Start Class
          </button>
          {detail.status === "scheduled" && (
            <button onClick={() => setShowCancelForm(true)} className="text-red-600 hover:bg-red-50 font-medium px-4 py-3 rounded-lg text-sm">
              Cancel Class
            </button>
          )}
        </div>
      )}

      {showCancelForm && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-8">
          <label className="block text-sm font-medium text-slate-700 mb-2">Reason for cancellation</label>
          <textarea
            value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={2}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm mb-3"
          />
          <div className="flex gap-2">
            <button onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg">
              Confirm Cancellation
            </button>
            <button onClick={() => setShowCancelForm(false)} className="text-slate-500 text-sm font-medium px-4 py-2">
              Back
            </button>
          </div>
        </div>
      )}

      {isEnded && (
        <div>
          <h2 className="font-semibold text-slate-900 mb-3">Attendance ({attendance.length})</h2>
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {attendance.map((a) => (
              <div key={a.public_id} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{a.student_name}{a.is_late_join && <span className="text-amber-600 text-xs ml-2">(late)</span>}</span>
                <span className="text-slate-500">{Math.round(a.total_duration_seconds / 60)} min</span>
              </div>
            ))}
            {attendance.length === 0 && <p className="text-sm text-slate-500 p-4">No attendance recorded.</p>}
          </div>
        </div>
      )}
    </div>
  );
}