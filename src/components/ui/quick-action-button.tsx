// src/components/ui/quick-action-button.tsx
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const colorMap = {
  indigo: "bg-indigo-50 text-indigo-600",
  teal: "bg-teal-50 text-teal-600",
  amber: "bg-amber-50 text-amber-600",
  rose: "bg-rose-50 text-rose-600",
  sky: "bg-sky-50 text-sky-600",
};

export function QuickActionButton({
  label, icon: Icon, color = "indigo", href,
}: { label: string; icon: LucideIcon; color?: keyof typeof colorMap; href: string }) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 min-w-[72px]">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center", colorMap[color])}>
        <Icon className="w-6 h-6" />
      </div>
      <span className="text-xs font-medium text-slate-600 text-center">{label}</span>
    </Link>
  );
}
