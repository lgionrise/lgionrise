// src/app/student/batches/[slug]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Script from "next/script";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BatchDetail } from "@/types/student-batch-detail";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import { CheckCircle, Loader2, Users, Calendar, Globe } from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudentBatchDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/student/batches/${slug}`)
      .then(async (r) => {
        if (r.status === 404) { setNotFound(true); return; }
        const data = await r.json();
        if (!r.ok) { setError(getErrorMessage(data.error)); return; }
        setBatch(data);
      });
  }, [slug]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !batch) return;
    const res = await fetch("/api/student/coupons/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: couponCode, purchase_amount: batch.effective_price, batch_id: batch.public_id }),
    });
    const data = await res.json();
    setCouponMessage(res.ok ? `Discount: ${formatCurrency(data.discount_amount)}` : getErrorMessage(data.error));
  };

  const handleEnroll = async () => {
    if (!batch) return;

    if (typeof window.Razorpay === "undefined") {
      setError("Payment system is still loading. Please wait a moment and try again.");
      return;
    }
    
    setError(""); setIsEnrolling(true);

    const orderRes = await fetch("/api/student/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ purchase_type: "batch_enrollment", batch_id: batch.public_id, coupon_code: couponCode }),
    });
    const order = await orderRes.json();

    if (!orderRes.ok) {
      setError(getErrorMessage(order.error) || "Could not start checkout. Payment gateway may not be configured yet.");
      setIsEnrolling(false);
      return;
    }

    const razorpay = new window.Razorpay({
      key: order.key,
      amount: Math.round(parseFloat(order.amount) * 100),
      currency: order.currency,
      name: "Learn and Grow",
      description: batch.title,
      order_id: order.order_id,
      handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
        const verifyRes = await fetch("/api/student/orders/verify", {
          method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(response),
        });
        const verifyData = await verifyRes.json();

        if (verifyRes.ok && verifyData.success !== false) {
          router.push(`/student/batches/${slug}`);
          router.refresh();
        } else {
          setError(verifyData.error?.message || verifyData.error || "Payment verification failed. Contact support if the amount was deducted.");
        }
      },

  if (notFound) return <p className="text-slate-500 text-center py-16">Batch not found.</p>;
  if (!batch) return <p className="text-slate-500 text-sm">Loading...</p>;

  return (
    <div className="max-w-3xl">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-6">
        {batch.thumbnail_url && <Image src={batch.thumbnail_url} alt={batch.title} fill className="object-cover" />}
      </div>

      <span className="text-xs font-medium text-indigo-600 uppercase">{batch.course.category}</span>
      <h1 className="text-2xl font-semibold text-slate-900 mt-1">{batch.title}</h1>
      <p className="text-slate-600 mt-2">{batch.description}</p>

      <div className="flex flex-wrap items-center gap-5 mt-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> {batch.language}</span>
        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Valid till {formatDate(batch.validity_end)}</span>
        {batch.seats_available !== null && (
          <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {batch.seats_available} seats left</span>
        )}
      </div>

      <div className="mt-8 border border-slate-200 rounded-xl p-6">
        {batch.is_enrolled ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">You&apos;re enrolled in this batch</span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-semibold text-slate-900">{formatCurrency(batch.effective_price)}</span>
              {batch.discounted_price && (
                <span className="text-sm text-slate-400 line-through">{formatCurrency(batch.price)}</span>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                value={couponCode} onChange={(e) => setCouponCode(e.target.value)} placeholder="Coupon code (optional)"
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
              />
              <button onClick={handleValidateCoupon} className="text-sm font-medium text-indigo-600 px-3">Apply</button>
            </div>
            {couponMessage && <p className="text-sm text-slate-500 mb-3">{couponMessage}</p>}

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">{error}</p>}

            <button
              onClick={handleEnroll} disabled={isEnrolling}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2"
            >
              {isEnrolling && <Loader2 className="w-4 h-4 animate-spin" />}
              Enroll Now
            </button>
          </>
        )}
      </div>

      {batch.schedules?.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-slate-900 mb-3">Weekly Schedule</h2>
          <div className="space-y-2">
            {batch.schedules.map((s) => (
              <div key={s.public_id} className="flex items-center justify-between text-sm border-b border-slate-100 py-2">
                <span className="font-medium">{DAYS[s.day_of_week]}</span>
                <span className="text-slate-500">{s.start_time} - {s.end_time}</span>
                <span className="text-slate-500">{s.subject}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
