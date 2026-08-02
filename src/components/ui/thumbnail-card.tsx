// src/components/ui/thumbnail-card.tsx
import Link from "next/link";
import Image from "next/image";
import { Star, Users, PlayCircle } from "lucide-react";
import { cn, formatCurrency, getInitials } from "@/lib/utils";

interface ThumbnailCardProps {
  href: string;
  title: string;
  thumbnailUrl?: string | null;
  categoryLabel?: string;
  teacherName?: string;
  teacherPhoto?: string | null;
  price?: string;
  rating?: number | null;
  seatsLeft?: number | null;
  statusBadge?: { label: string; color: "green" | "amber" | "slate" | "red" };
  isVideo?: boolean;
}

const badgeColors = {
  green: "bg-emerald-500 text-white",
  amber: "bg-amber-500 text-white",
  slate: "bg-slate-500 text-white",
  red: "bg-red-500 text-white",
};

export function ThumbnailCard({
  href, title, thumbnailUrl, categoryLabel, teacherName, teacherPhoto,
  price, rating, seatsLeft, statusBadge, isVideo,
}: ThumbnailCardProps) {
  return (
    <Link href={href} className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.98] transition-transform">
      <div className="relative aspect-video bg-gradient-to-br from-indigo-100 to-violet-100">
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-indigo-300 text-3xl font-bold">
            {title.slice(0, 1)}
          </div>
        )}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <PlayCircle className="w-10 h-10 text-white drop-shadow-lg" />
          </div>
        )}
        {statusBadge && (
          <span className={cn("absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full", badgeColors[statusBadge.color])}>
            {statusBadge.label}
          </span>
        )}
        {categoryLabel && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/90 text-indigo-600">
            {categoryLabel}
          </span>
        )}
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-sm text-slate-900 line-clamp-2 leading-snug">{title}</h3>

        {teacherName && (
          <div className="flex items-center gap-1.5 mt-2">
            <div className="w-5 h-5 rounded-full bg-indigo-100 overflow-hidden relative shrink-0">
              {teacherPhoto ? (
                <Image src={teacherPhoto} alt={teacherName} fill className="object-cover" />
              ) : (
                <span className="w-full h-full flex items-center justify-center text-[9px] font-bold text-indigo-600">
                  {getInitials(teacherName.split(" ")[0] || "", teacherName.split(" ")[1] || "")}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 truncate">{teacherName}</span>
          </div>
        )}

        {(price || rating || seatsLeft !== undefined) && (
          <div className="flex items-center justify-between mt-2.5">
            {price && <span className="font-bold text-sm text-slate-900">{formatCurrency(price)}</span>}
            <div className="flex items-center gap-2">
              {rating != null && (
                <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {rating.toFixed(1)}
                </span>
              )}
              {seatsLeft != null && (
                <span className="flex items-center gap-0.5 text-xs text-slate-400">
                  <Users className="w-3 h-3" /> {seatsLeft}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
