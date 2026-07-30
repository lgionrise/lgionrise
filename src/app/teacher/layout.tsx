// src/app/teacher/layout.tsx
import { requireTeacher } from "@/lib/current-user";
import { TeacherSidebar } from "@/components/teacher/teacher-sidebar";
import { PendingApprovalScreen } from "@/components/teacher/pending-approval-screen";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTeacher();
  
  if (!user.is_approved) {
    return <PendingApprovalScreen />;
  }
  
  return (
    <div className="flex min-h-screen bg-slate-50">
      <TeacherSidebar user={user} />
      <main className="flex-1 ml-64">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}