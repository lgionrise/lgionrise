"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";

function Verify2FAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const res = await fetch("/api/auth/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Invalid OTP. Try again.");
      setIsLoading(false);
      return;
    }

    if (data.user?.role === "teacher") router.replace("/teacher");
    else if (data.user?.role === "student") router.replace("/student");
    else router.replace("/");
    router.refresh();
  };

  const handleResend = async () => {
    setError("");
    setMessage("");
    setIsResending(true);
    const res = await fetch("/api/auth/resend-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) setError(data.error || "Could not resend OTP.");
    else setMessage("OTP sent to your email.");
    setIsResending(false);
  };

  if (!email) {
    return (
      <p className="text-center text-sm text-slate-600 mt-10">
        Missing email. <Link href="/login" className="text-indigo-600 font-semibold">Back to login</Link>
      </p>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700 flex flex-col">
      <div className="pt-16 pb-8 px-6 text-center text-white">
        <BrandLogo size={64} />
        <h1 className="text-2xl font-bold mt-4">Enter verification code</h1>
        <p className="text-white/70 text-sm mt-1">We sent a code to {email}</p>
      </div>

      <div className="flex-1 bg-slate-50 rounded-t-3xl px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          <form onSubmit={handleVerify} className="space-y-3">
            <input
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              required
              placeholder="6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm tracking-[0.3em] text-center font-semibold"
            />
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">
                {error}
              </p>
            )}
            {message && (
              <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading || otp.length < 4}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify & Continue
            </button>
          </form>

          <button
            type="button"
            onClick={handleResend}
            disabled={isResending}
            className="w-full text-sm text-indigo-600 font-medium mt-4 disabled:opacity-60"
          >
            {isResending ? "Sending..." : "Resend OTP"}
          </button>

          <p className="text-center text-sm text-slate-500 mt-6">
            <Link href="/login" className="text-indigo-600 font-semibold">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <Verify2FAForm />
    </Suspense>
  );
}
