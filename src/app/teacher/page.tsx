// src/app/teacher/page.tsx
import { djangoFetch } from "@/lib/django-api";
import { TeacherDashboardOverview } from "@/types/teacher";
import { StatCard } from "@/components/ui/stat-card";
import { formatCurrency } from "@/lib/utils";
import { Users, BookOpen, Video, Calendar, HelpCircle, Wallet } from "lucide-react";

async function getDashboard(): Promise < TeacherDashboardOverview | null > {
  const res = await djangoFetch("/teacher/dashboard/");
  if (!res.ok) return null;
  return res.json();
}

export default async function TeacherDashboardPage() {
  const data = await getDashboard();
  
  if (!data) {
    return <p className="text-red-600">Could not load dashboard. Please refresh.</p>;
  }
  
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        <StatCard label="Total Students" value={data.total_students} icon={Users} accentColor="indigo" />
        <StatCard label="Total Batches" value={data.total_batches} icon={BookOpen} accentColor="green" />
        <StatCard label="This Month's Earnings" value={formatCurrency(data.current_month_earnings)} icon={Wallet} accentColor="amber" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Today's Classes" value={data.todays_classes_count} icon={Video} accentColor="rose" />
        <StatCard label="Upcoming Classes" value={data.upcoming_classes_count} icon={Calendar} accentColor="indigo" />
        <StatCard label="Pending Doubts" value={data.pending_doubts} icon={HelpCircle} accentColor="amber" />
      </div>
    </div>
  );
}