// src/app/student/layout.tsx
import { requireStudent } from "@/lib/current-student";
import { StudentSidebar } from "@/components/student/student-sidebar";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:block">
        <StudentSidebar user={user} />
      </div>
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-8">{children}</main>
      <MobileBottomNav role="student" />
    </div>
  );
}
