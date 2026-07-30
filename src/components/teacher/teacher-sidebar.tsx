// src/components/teacher/teacher-sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn, getInitials } from "@/lib/utils";
import { TeacherUser } from "@/types/teacher";
import {
  LayoutDashboard, BookOpen, Video, HelpCircle, Users2, Wallet,
  FileText, ClipboardList, CalendarClock, Bell, LifeBuoy, LogOut, GraduationCap,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
  { label: "Batches", href: "/teacher/batches", icon: BookOpen },
  { label: "Live Classes", href: "/teacher/live-classes", icon: Video },
  { label: "Study Material", href: "/teacher/content", icon: FileText },
  { label: "Tests & Questions", href: "/teacher/tests", icon: ClipboardList },
  { label: "Doubts", href: "/teacher/doubts", icon: HelpCircle },
  { label: "Private Tuition", href: "/teacher/tuition", icon: CalendarClock },
  { label: "Earnings", href: "/teacher/earnings", icon: Wallet },
  { label: "Notifications", href: "/teacher/notifications", icon: Bell },
  { label: "Support", href: "/teacher/support", icon: LifeBuoy },
];

export function TeacherSidebar({ user }: { user: TeacherUser }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="w-64 h-screen bg-slate-900 text-slate-100 flex flex-col fixed left-0 top-0">
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-slate-800">
        <div className="bg-indigo-600 p-1.5 rounded-lg">
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <span className="font-semibold text-sm">Learn and Grow</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
              )}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}

        {user.can_manage_teachers && (
          <Link
            href="/teacher/manage-teachers"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2 border-t border-slate-800 pt-4",
              pathname === "/teacher/manage-teachers" ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-white"
            )}
          >
            <Users2 className="w-4 h-4" />
            Manage Teachers
          </Link>
        )}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <div className="flex items-center gap-3 px-2 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-semibold shrink-0">
            {getInitials(user.first_name, user.last_name)}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{user.first_name} {user.last_name}</p>
            <Link href="/teacher/profile" className="text-xs text-slate-500 hover:text-slate-300">
              View profile
            </Link>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}