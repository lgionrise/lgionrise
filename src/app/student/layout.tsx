// src/app/student/layout.tsx
import { requireStudent } from "@/lib/current-student";
import { StudentSidebar } from "@/components/student/student-sidebar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStudent();

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar user={user} />
      <main className="flex-1 ml-64">
        <div className="max-w-6xl mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
