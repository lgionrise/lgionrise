// src/app/teacher/layout.tsx
import { requireTeacher } from "@/lib/current-user";
import { TeacherSidebar } from "@/components/teacher/teacher-sidebar";
import { PendingApprovalScreen } from "@/components/teacher/pending-approval-screen";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTeacher();

  if (!user.is_approved) {
    return <PendingApprovalScreen />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="hidden lg:block">
        <TeacherSidebar user={user} />
      </div>
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-8">{children}</main>
      <MobileBottomNav role="teacher" />
    </div>
  );
}
