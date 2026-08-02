// src/components/shared/mobile-bottom-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LucideIcon, LayoutDashboard, BookOpen, Video, HelpCircle, User } from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const teacherItems: NavItem[] = [
  { label: "Home", href: "/teacher", icon: LayoutDashboard },
  { label: "Batches", href: "/teacher/batches", icon: BookOpen },
  { label: "Live", href: "/teacher/live-classes", icon: Video },
  { label: "Doubts", href: "/teacher/doubts", icon: HelpCircle },
  { label: "Profile", href: "/teacher/profile", icon: User },
];

const studentItems: NavItem[] = [
  { label: "Home", href: "/student", icon: LayoutDashboard },
  { label: "Batches", href: "/student/batches", icon: BookOpen },
  { label: "Live", href: "/student/live-classes", icon: Video },
  { label: "Doubts", href: "/student/doubts", icon: HelpCircle },
  { label: "Profile", href: "/student/profile", icon: User },
];

export function MobileBottomNav({ role }: { role: "teacher" | "student" }) {
  const pathname = usePathname();
  const items = role === "teacher" ? teacherItems : studentItems;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-100 px-2 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="flex items-center justify-around py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-3 py-1.5 min-w-[56px]">
              <div className={cn("p-1.5 rounded-xl transition-colors", isActive ? "bg-indigo-600" : "bg-transparent")}>
                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
              </div>
              <span className={cn("text-[10px] font-medium", isActive ? "text-indigo-600" : "text-slate-400")}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
