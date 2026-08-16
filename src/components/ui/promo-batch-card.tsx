// src/components/ui/promo-batch-card.tsx
import Link from "next/link";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";

interface PromoBatchCardProps {
  href: string;
  title: string;
  thumbnailUrl?: string | null;
  language: string;
  price: string;
  discountedPrice: string | null;
  effectivePrice: string;
  status?: string;
  startDate?: string;
}

export function PromoBatchCard({
  href, title, thumbnailUrl, language, price, discountedPrice, effectivePrice, status, startDate,
}: PromoBatchCardProps) {
  const hasDiscount = discountedPrice && parseFloat(discountedPrice) < parseFloat(price);
  const discountPercent = hasDiscount
    ? Math.round(((parseFloat(price) - parseFloat(discountedPrice!)) / parseFloat(price)) * 100)
    : 0;

  return (
    <Link href={href} className="block bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.98] transition-transform">
      <div className="relative aspect-[16/8] bg-gradient-to-br from-rose-100 via-pink-100 to-violet-100">
        {thumbnailUrl ? (
          <Image src={thumbnailUrl} alt={title} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-rose-300 text-4xl font-bold">
            {title.slice(0, 1)}
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-semibold px-2.5 py-1 rounded-full text-indigo-700">
          🏆 Multiple plans inside
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-slate-500 uppercase">{language}</span>
          {status === "live" && (
            <span className="flex items-center gap-1 text-xs font-medium text-rose-600">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" /> Ongoing
            </span>
          )}
        </div>

        <h3 className="font-bold text-slate-900 leading-snug line-clamp-2 mb-1">{title}</h3>
        {startDate && <p className="text-xs text-slate-400 mb-3">Started on {startDate}</p>}

        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900">{formatCurrency(effectivePrice)}</span>
              {hasDiscount && <span className="text-sm text-slate-400 line-through">{formatCurrency(price)}</span>}
            </div>
            {hasDiscount && <span className="text-xs font-semibold text-emerald-600">{discountPercent}% OFF</span>}
          </div>
          <span className="bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-xl whitespace-nowrap">
            Buy Now
          </span>
        </div>
      </div>
    </Link>
  );
}
