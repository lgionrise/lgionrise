// src/components/shared/mobile-top-bar.tsx — poori file replace karo
"use client";

import Link from "next/link";
import Image from "next/image";
import { Bell } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface MobileTopBarProps {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
  role: "teacher" | "student";
  unreadCount?: number;
}

export function MobileTopBar({ firstName, lastName, photoUrl, role, unreadCount = 0 }: MobileTopBarProps) {
  return (
    <header className="w-full sticky top-0 z-30 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 pt-4 pb-5 rounded-b-2xl lg:rounded-none overflow-hidden">
      <div className="flex items-center justify-between gap-2 max-w-full">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <Link href={`/${role}/profile`} className="w-10 h-10 rounded-full bg-white/20 overflow-hidden relative shrink-0 border-2 border-white/40">
            {photoUrl ? (
              <Image src={photoUrl} alt={firstName} fill className="object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-xs font-bold">
                {getInitials(firstName, lastName)}
              </span>
            )}
          </Link>
          <div className="min-w-0">
            <p className="text-[11px] text-white/70 leading-tight">Welcome back 👋</p>
            <p className="font-semibold text-sm truncate">{firstName} {lastName}</p>
          </div>
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
