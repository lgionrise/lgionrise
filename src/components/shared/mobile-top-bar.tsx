// src/components/shared/mobile-top-bar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import { getInitials } from "@/lib/utils";

export function MobileTopBar({
  firstName, lastName, photoUrl, role, unreadCount = 0,
}: { firstName: string; lastName: string; photoUrl?: string | null; role: "teacher" | "student"; unreadCount?: number }) {
  return (
    <header className="fixed top-0 left-0 right-0 lg:left-64 z-30 h-[72px] bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 flex items-center">
      <div className="flex items-center justify-between gap-2 w-full max-w-5xl mx-auto">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Link href={`/${role}/profile`} className="w-9 h-9 rounded-full bg-white/20 overflow-hidden relative shrink-0 border-2 border-white/40">
            {photoUrl ? <Image src={photoUrl} alt={firstName} fill className="object-cover" /> : (
              <span className="w-full h-full flex items-center justify-center text-xs font-bold">{getInitials(firstName, lastName)}</span>
            )}
          </Link>
          <p className="font-semibold text-sm truncate">{firstName} {lastName}</p>
        </div>
        <Link href={`/${role}/notifications`} className="relative bg-white/15 p-2 rounded-full shrink-0">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
