// src/app/teacher/page.tsx
import { djangoFetch } from "@/lib/django-api";
import { requireTeacher } from "@/lib/current-user";
import { TeacherDashboardOverview } from "@/types/teacher";
import { MobileTopBar } from "@/components/shared/mobile-top-bar";
import { GradientCard } from "@/components/ui/gradient-card";
import { QuickActionButton } from "@/components/ui/quick-action-button";
import { formatCurrency } from "@/lib/utils";
import {
  Users, BookOpen, Video, Calendar, HelpCircle, Wallet,
  Plus, PlaySquare, Wallet as WalletIcon, FileText,
} from "lucide-react";

async function getDashboard(): Promise<TeacherDashboardOverview | null> {
  const res = await djangoFetch("/teacher/dashboard/");
  if (!res.ok) return null;
  return res.json();
}

export default async function TeacherDashboardPage() {
  const user = await requireTeacher();
  const data = await getDashboard();

  return (
    <div>
      <MobileTopBar firstName={user.first_name} lastName={user.last_name} photoUrl={user.profile_photo} role="teacher" />

      <div className="px-5 -mt-3 lg:mt-6">
        {!data ? (
          <p className="text-red-600 bg-white rounded-2xl p-4 shadow-sm">Could not load dashboard. Please refresh.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <GradientCard label="Students" value={data.total_students} icon={Users} color="indigo" href="/teacher/batches" />
              <GradientCard label="Batches" value={data.total_batches} icon={BookOpen} color="teal" href="/teacher/batches" />
              <GradientCard label="Today's Classes" value={data.todays_classes_count} icon={Video} color="rose" href="/teacher/live-classes" />
              <GradientCard label="This Month" value={formatCurrency(data.current_month_earnings)} icon={Wallet} color="amber" href="/teacher/earnings" />
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm mb-6">
              <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h2>
              <div className="flex gap-4 overflow-x-auto pb-1">
                <QuickActionButton label="New Class" icon={Video} color="rose" href="/teacher/live-classes/schedule" />
                <QuickActionButton label="Add Batch" icon={Plus} color="indigo" href="/teacher/batches/create" />
                <QuickActionButton label="Upload Video" icon={PlaySquare} color="teal" href="/teacher/recordings" />
                <QuickActionButton label="Payments" icon={WalletIcon} color="amber" href="/teacher/earnings" />
                <QuickActionButton label="Study Material" icon={FileText} color="sky" href="/teacher/content" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GradientCard label="Upcoming Classes" value={data.upcoming_classes_count} icon={Calendar} color="sky" href="/teacher/live-classes" />
              <GradientCard label="Pending Doubts" value={data.pending_doubts} icon={HelpCircle} color="rose" href="/teacher/doubts" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
