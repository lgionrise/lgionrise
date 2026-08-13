// src/app/teacher/notifications/page.tsx
"use client";

import { useState, useEffect } from "react";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { Skeleton } from "@/components/ui/skeleton";
import { AppNotification } from "@/types/notification";
import { cn, formatDateTime } from "@/lib/utils";
import { Bell, CheckCheck, Video, HelpCircle, Wallet, FileText, Megaphone } from "lucide-react";

const categoryStyle: Record<string, { icon: typeof Bell; color: string }> = {
  class_reminder: { icon: Video, color: "bg-rose-100 text-rose-600" },
  class_update: { icon: Video, color: "bg-rose-100 text-rose-600" },
  doubt_reply: { icon: HelpCircle, color: "bg-amber-100 text-amber-600" },
  payment: { icon: Wallet, color: "bg-emerald-100 text-emerald-600" },
  new_content: { icon: FileText, color: "bg-sky-100 text-sky-600" },
  announcement: { icon: Megaphone, color: "bg-indigo-100 text-indigo-600" },
};
const defaultStyle = { icon: Bell, color: "bg-slate-100 text-slate-500" };

export default function TeacherNotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = () => {
    fetch("/api/teacher/notifications").then((r) => r.json()).then((d) => setItems(d.results || [])).finally(() => setIsLoading(false));
  };
  useEffect(() => { load(); }, []);

  const markRead = async (id: string) => { await fetch(`/api/teacher/notifications/${id}/read`, { method: "POST" }); load(); };
  const markAll = async () => { await fetch("/api/teacher/notifications/mark-all-read", { method: "POST" }); load(); };

  return (
    <>
      <MobileTopBar firstName="" lastName="" role="teacher" />
      <div className="pt-24 px-4 pb-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-lg font-bold text-slate-900">Notifications</h1>
          <button onClick={markAll} className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-2">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((n) => {
              const style = categoryStyle[n.category] || defaultStyle;
              const Icon = style.icon;
              return (
                <button
                  key={n.public_id} onClick={() => !n.is_read && markRead(n.public_id)}
                  className={cn("w-full text-left flex gap-3 bg-white rounded-2xl p-3.5 shadow-sm", !n.is_read && "ring-2 ring-indigo-100")}
                >
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", style.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={cn("text-sm truncate", !n.is_read ? "font-semibold text-slate-900" : "text-slate-700")}>{n.title}</p>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">{n.body}</p>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(n.created_at)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
