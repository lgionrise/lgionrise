// src/app/verify-email/page.tsx
"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";

function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const password = searchParams.get("password") || "";
  const role = searchParams.get("role") || "student";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);

    const verifyRes = await fetch("/api/auth/otp/verify", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, otp, purpose: "signup" }),
    });
    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) { setError(verifyData.error || "Invalid or expired code."); setIsLoading(false); return; }

    // Verified — now log them in
    const loginRes = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
    });
    const loginData = await loginRes.json();

    if (!loginRes.ok) { setError("Verified, but auto-login failed — please log in manually."); setIsLoading(false); router.push("/login"); return; }

    router.push(role === "teacher" ? "/teacher" : "/student");
    router.refresh();
  };

  const resendOtp = async () => {
    setMessage(""); setError("");
    const res = await fetch("/api/auth/otp/request", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: email, purpose: "signup" }),
    });
    setMessage(res.ok ? "A new code has been sent." : "Could not resend code.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700 flex flex-col">
      <div className="pt-16 pb-8 px-6 text-center text-white">
        <BrandLogo size={64} />
        <h1 className="text-2xl font-bold mt-4">Verify your email</h1>
        <p className="text-white/70 text-sm mt-1">We sent a code to {email}</p>
      </div>

      <div className="flex-1 bg-slate-50 rounded-t-3xl px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          <form onSubmit={handleVerify} className="space-y-3">
            <input
              required maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)}
              placeholder="6-digit code"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm tracking-[0.4em] text-center"
            />
            {message && <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">{message}</p>}
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}

            <button type="submit" disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify & Continue
            </button>
          </form>

          <button onClick={resendOtp} className="w-full text-center text-sm font-medium text-indigo-600 mt-4">
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailForm />
    </Suspense>
  );
}
