// src/app/teacher/tuition/bookings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TuitionBooking } from "@/types/tuition";
import { cn, formatCurrency, formatDateTime } from "@/lib/utils";
import { Video } from "lucide-react";

const statusStyles: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-indigo-100 text-indigo-700",
  rejected: "bg-slate-100 text-slate-500",
  rescheduled: "bg-blue-100 text-blue-700",
  cancelled: "bg-rose-100 text-rose-700",
  completed: "bg-emerald-100 text-emerald-700",
  no_show: "bg-slate-100 text-slate-500",
};

export default function TuitionBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<TuitionBooking[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadBookings = () => {
    const params = statusFilter ? `?status=${statusFilter}` : "";
    fetch(`/api/teacher/tuition/bookings${params}`)
      .then((r) => r.json())
      .then((data) => setBookings(data.results || []))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { loadBookings(); }, [statusFilter]);

  const handleAcceptReject = async (publicId: string, action: "accept" | "reject") => {
    await fetch(`/api/teacher/tuition/bookings/${publicId}/accept-reject`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    loadBookings();
  };

  const handleComplete = async (publicId: string) => {
    await fetch(`/api/teacher/tuition/bookings/${publicId}/complete`, { method: "POST" });
    loadBookings();
  };

  const handleCancel = async (publicId: string) => {
    const reason = prompt("Reason for cancellation:");
    if (reason === null) return;
    await fetch(`/api/teacher/tuition/bookings/${publicId}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    loadBookings();
  };

  const handleJoin = async (publicId: string) => {
    router.push(`/teacher/tuition/bookings/${publicId}/session`);
  };

  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Tuition Bookings</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["", "pending", "confirmed", "completed", "cancelled"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={cn("text-xs font-medium px-3 py-1.5 rounded-full capitalize",
              statusFilter === s ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600")}>
            {s || "All"}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {bookings.map((b) => (
            <div key={b.public_id} className="px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium">{b.subject}</p>
                  <p className="text-xs text-slate-500">{formatDateTime(b.scheduled_start)} • {b.duration_minutes} min • {formatCurrency(b.amount_charged)}</p>
                </div>
                <span className={cn("text-xs font-medium px-2.5 py-1 rounded-full capitalize", statusStyles[b.status])}>
                  {b.status.replace("_", " ")}
                </span>
              </div>

              <div className="flex gap-2 mt-2">
                {b.status === "pending" && (
                  <>
                    <button onClick={() => handleAcceptReject(b.public_id, "accept")} className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                      Accept
                    </button>
                    <button onClick={() => handleAcceptReject(b.public_id, "reject")} className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                      Reject
                    </button>
                  </>
                )}
                {b.status === "confirmed" && (
                  <>
                    <button onClick={() => handleJoin(b.public_id)} className="flex items-center gap-1.5 text-xs font-medium text-white bg-indigo-600 px-3 py-1.5 rounded-lg">
                      <Video className="w-3.5 h-3.5" /> Join
                    </button>
                    <button onClick={() => handleComplete(b.public_id)} className="text-xs font-medium text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg">
                      Mark Complete
                    </button>
                    <button onClick={() => handleCancel(b.public_id)} className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
          {bookings.length === 0 && <p className="text-sm text-slate-500 p-4">No bookings found.</p>}
        </div>
      )}
    </div>
  );
}