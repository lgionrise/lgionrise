// src/components/ui/gradient-card.tsx
import Link from "next/link";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const gradients = {
  indigo: "from-indigo-500 to-violet-600",
  teal: "from-teal-400 to-emerald-600",
  amber: "from-amber-400 to-orange-600",
  rose: "from-rose-400 to-pink-600",
  sky: "from-sky-400 to-blue-600",
};

interface GradientCardProps {
  label: string;
  value?: string | number;
  icon: LucideIcon;
  color?: keyof typeof gradients;
  href?: string;
  onClick?: () => void;
}

export function GradientCard({ label, value, icon: Icon, color = "indigo", href, onClick }: GradientCardProps) {
  const content = (
    <div className={cn("bg-gradient-to-br rounded-2xl p-4 text-white shadow-sm active:scale-95 transition-transform", gradients[color])}>
      <Icon className="w-6 h-6 mb-3 opacity-90" />
      {value !== undefined && <p className="text-xl font-bold leading-tight">{value}</p>}
      <p className="text-xs font-medium opacity-90 mt-0.5">{label}</p>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return <button onClick={onClick} className="w-full text-left">{content}</button>;
}
