// src/components/shared/mobile-top-bar.tsx
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
    <header className="sticky top-0 z-30 bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-5 pt-5 pb-6 rounded-b-3xl lg:rounded-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={`/${role}/profile`} className="w-11 h-11 rounded-full bg-white/20 overflow-hidden relative shrink-0 border-2 border-white/40">
            {photoUrl ? (
              <Image src={photoUrl} alt={firstName} fill className="object-cover" />
            ) : (
              <span className="w-full h-full flex items-center justify-center text-sm font-bold">
                {getInitials(firstName, lastName)}
              </span>
            )}
          </Link>
          <div>
            <p className="text-xs text-white/70">Welcome back 👋</p>
            <p className="font-semibold">{firstName} {lastName}</p>
          </div>
        </div>

        <Link href={`/${role}/notifications`} className="relative bg-white/15 p-2.5 rounded-full">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
