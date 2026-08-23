// src/app/student/batches/[slug]/page.tsx
"use client";

import { useState, useEffect, use } from "react";
import Script from "next/script";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BatchDetail } from "@/types/student-batch-detail";
import { formatCurrency, formatDate, getErrorMessage } from "@/lib/utils";
import {
  CheckCircle,
  Loader2,
  Users,
  Calendar,
  Globe,
} from "lucide-react";

declare global {
  interface Window {
    Razorpay: new (
      options: Record<string, unknown>
    ) => {
      open: () => void;
    };
  }
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudentBatchDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();

  const [batch, setBatch] = useState<BatchDetail | null>(null);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadBatch = async () => {
      try {
        setError("");
        setNotFound(false);

        const res = await fetch(`/api/student/batches/${slug}`);

        if (res.status === 404) {
          if (!cancelled) {
            setNotFound(true);
          }
          return;
        }

        const data = await res.json();

        if (!res.ok) {
          if (!cancelled) {
            setError(
              getErrorMessage(data.error) || "Could not load batch."
            );
          }
          return;
        }

        if (!cancelled) {
          setBatch(data);
        }
      } catch (err) {
        console.error("Failed to load batch:", err);

        if (!cancelled) {
          setError("Could not load batch. Please try again.");
        }
      }
    };

    loadBatch();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !batch) {
      return;
    }

    try {
      setCouponMessage("");

      const res = await fetch("/api/student/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.trim(),
          purchase_amount: batch.effective_price,
          batch_id: batch.public_id,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setCouponMessage(
          `Discount: ${formatCurrency(data.discount_amount)}`
        );
      } else {
        setCouponMessage(
          getErrorMessage(data.error) || "Invalid coupon code."
        );
      }
    } catch (err) {
      console.error("Coupon validation failed:", err);
      setCouponMessage("Could not validate coupon. Please try again.");
    }
  };

  const handleEnroll = async () => {
    if (!batch || isEnrolling) {
      return;
    }

    setError("");

    if (typeof window.Razorpay === "undefined") {
      setError(
        "Payment system is still loading. Please wait a moment and try again."
      );
      return;
    }

    setIsEnrolling(true);

    try {
      const orderRes = await fetch("/api/student/orders/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          purchase_type: "batch_enrollment",
          batch_id: batch.public_id,
          coupon_code: couponCode.trim(),
        }),
      });

      const order = await orderRes.json();

      if (!orderRes.ok) {
        setError(
          getErrorMessage(order.error) ||
            "Could not start checkout. Payment gateway may not be configured yet."
        );
        setIsEnrolling(false);
        return;
      }

      if (
        !order.key ||
        !order.order_id ||
        !order.amount ||
        !order.currency
      ) {
        setError("Invalid payment order received. Please try again.");
        setIsEnrolling(false);
        return;
      }

      const razorpay = new window.Razorpay({
        key: order.key,
        amount: Math.round(parseFloat(String(order.amount)) * 100),
        currency: order.currency,
        name: "Learn and Grow",
        description: batch.title,
        order_id: order.order_id,

        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await fetch(
              "/api/student/orders/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(response),
              }
            );

            const verifyData = await verifyRes.json();

            if (verifyRes.ok && verifyData.success !== false) {
              router.push(`/student/batches/${slug}`);
              router.refresh();
              return;
            }

            setError(
              verifyData.error?.message ||
                verifyData.error ||
                "Payment verification failed. Contact support if the amount was deducted."
            );

            setIsEnrolling(false);
          } catch (err) {
            console.error("Payment verification failed:", err);

            setError(
              "Payment was received, but verification failed. Contact support if the amount was deducted."
            );

            setIsEnrolling(false);
          }
        },

        modal: {
          ondismiss: () => {
            setIsEnrolling(false);
          },
        },
      });

      razorpay.open();
    } catch (err) {
      console.error("Checkout failed:", err);

      setError(
        "Could not start checkout. Please check your connection and try again."
      );

      setIsEnrolling(false);
    }
  };

  if (notFound) {
    return (
      <p className="text-slate-500 text-center py-16">
        Batch not found.
      </p>
    );
  }

  if (!batch) {
    if (error) {
      return (
        <div className="max-w-3xl">
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        </div>
      );
    }

    return (
      <p className="text-slate-500 text-sm">
        Loading...
      </p>
    );
  }

  return (
    <div className="max-w-3xl">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 mb-6">
        {batch.thumbnail_url ? (
          <Image
            src={batch.thumbnail_url}
            alt={batch.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-400">
            No image available
          </div>
        )}
      </div>

      <span className="text-xs font-medium text-indigo-600 uppercase">
        {batch.course.category}
      </span>

      <h1 className="text-2xl font-semibold text-slate-900 mt-1">
        {batch.title}
      </h1>

      <p className="text-slate-600 mt-2">
        {batch.description}
      </p>

      <div className="flex flex-wrap items-center gap-5 mt-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <Globe className="w-4 h-4" />
          {batch.language}
        </span>

        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          Valid till {formatDate(batch.validity_end)}
        </span>

        {batch.seats_available !== null && (
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            {batch.seats_available} seats left
          </span>
        )}
      </div>

      <div className="mt-8 border border-slate-200 rounded-xl p-6">
        {batch.is_enrolled ? (
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle className="w-5 h-5" />

            <span className="font-medium">
              You&apos;re enrolled in this batch
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-2xl font-semibold text-slate-900">
                {formatCurrency(batch.effective_price)}
              </span>

              {batch.discounted_price && (
                <span className="text-sm text-slate-400 line-through">
                  {formatCurrency(batch.price)}
                </span>
              )}
            </div>

            <div className="flex gap-2 mb-4">
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                placeholder="Coupon code (optional)"
                className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
              />

              <button
                type="button"
                onClick={handleValidateCoupon}
                disabled={!couponCode.trim()}
                className="text-sm font-medium text-indigo-600 px-3 disabled:opacity-50"
              >
                Apply
              </button>
            </div>

            {couponMessage && (
              <p className="text-sm text-slate-500 mb-3">
                {couponMessage}
              </p>
            )}

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleEnroll}
              disabled={isEnrolling}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium px-6 py-3 rounded-lg flex items-center gap-2"
            >
              {isEnrolling && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}

              {isEnrolling ? "Processing..." : "Enroll Now"}
            </button>
          </>
        )}
      </div>

      {batch.schedules?.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-slate-900 mb-3">
            Weekly Schedule
          </h2>

          <div className="space-y-2">
            {batch.schedules.map((s) => (
              <div
                key={s.public_id}
                className="flex items-center justify-between gap-4 text-sm border-b border-slate-100 py-2"
              >
                <span className="font-medium">
                  {DAYS[s.day_of_week]}
                </span>

                <span className="text-slate-500">
                  {s.start_time} - {s.end_time}
                </span>

                <span className="text-slate-500">
                  {s.subject}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
