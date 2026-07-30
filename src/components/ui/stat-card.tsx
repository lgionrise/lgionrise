// src/components/ui/stat-card.tsx
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  accentColor ? : "indigo" | "green" | "amber" | "rose";
}

const accentMap = {
  indigo: "bg-indigo-50 text-indigo-600",
  green: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
};

export function StatCard({ label, value, icon: Icon, accentColor = "indigo" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 mb-1">{label}</p>
          <p className="text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={cn("p-2.5 rounded-lg", accentMap[accentColor])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}