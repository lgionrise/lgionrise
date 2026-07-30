// src/app/teacher/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AppNotification } from "@/types/notification";
import { cn, formatDateTime } from "@/lib/utils";
import { Settings } from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    fetch("/api/teacher/notifications").then((r) => r.json()).then((data) => setNotifications(data.results || [])).finally(() => setIsLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (publicId: string) => {
    await fetch(`/api/teacher/notifications/${publicId}/read`, { method: "POST" });
    load();
  };

  const markAllRead = async () => {
    await fetch("/api/teacher/notifications/mark-all-read", { method: "POST" });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Notifications</h1>
        <div className="flex gap-3">
          <button onClick={markAllRead} className="text-sm font-medium text-indigo-600">Mark all read</button>
          <Link href="/teacher/notifications/settings" className="text-slate-500"><Settings className="w-4 h-4" /></Link>
        </div>
      </div>

      {isLoading ? (
        <p className="text-slate-500 text-sm">Loading...</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {notifications.map((n) => (
            <button
              key={n.public_id} onClick={() => !n.is_read && markRead(n.public_id)}
              className={cn("w-full text-left px-5 py-4 hover:bg-slate-50", !n.is_read && "bg-indigo-50/50")}
            >
              <div className="flex items-start justify-between">
                <p className={cn("text-sm", !n.is_read && "font-semibold")}>{n.title}</p>
                {!n.is_read && <span className="w-2 h-2 bg-indigo-600 rounded-full mt-1.5 shrink-0" />}
              </div>
              <p className="text-sm text-slate-500 mt-0.5">{n.body}</p>
              <p className="text-xs text-slate-400 mt-1">{formatDateTime(n.created_at)}</p>
            </button>
          ))}
          {notifications.length === 0 && <p className="text-sm text-slate-500 p-4">No notifications.</p>}
        </div>
      )}
    </div>
  );
}
