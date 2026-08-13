// src/app/forgot-password/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const requestOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);
    const res = await fetch("/api/auth/password-reset/request", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier }),
    });
    setIsLoading(false);
    if (!res.ok) { const d = await res.json(); setError(d.error || "Failed to send code."); return; }
    setMessage("A reset code has been sent to your email.");
    setStep(2);
  };

  const confirmReset = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);
    const res = await fetch("/api/auth/password-reset/confirm", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, otp, new_password: newPassword }),
    });
    const data = await res.json();
    setIsLoading(false);
    if (!res.ok) { setError(data.error || "Invalid or expired code."); return; }
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700 flex flex-col">
      <div className="pt-16 pb-8 px-6 text-center text-white">
        <BrandLogo />
        <h1 className="text-2xl font-bold mt-4">Reset Password</h1>
        <p className="text-white/70 text-sm mt-1">{step === 1 ? "Enter your email to get a reset code" : "Enter the code and your new password"}</p>
      </div>

      <div className="flex-1 bg-slate-50 rounded-t-3xl px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          {step === 1 ? (
            <form onSubmit={requestOtp} className="space-y-3">
              <input required type="email" placeholder="Email address" value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm" />
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}
              <button type="submit" disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Send Code
              </button>
            </form>
          ) : (
            <form onSubmit={confirmReset} className="space-y-3">
              {message && <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">{message}</p>}
              <input required placeholder="6-digit code" maxLength={6} value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm tracking-[0.4em] text-center" />
              <input required type="password" placeholder="New password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm" />
              {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}
              <button type="submit" disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />} Reset Password
              </button>
            </form>
          )}
          <p className="text-center text-sm text-slate-500 mt-6">
            <Link href="/login" className="text-indigo-600 font-semibold">Back to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
