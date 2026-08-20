// src/app/login/verify-2fa/page.tsx
"use client";

import { useState, FormEvent, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";

function Verify2FAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);

    const res = await fetch("/api/auth/login/verify-2fa", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, code }),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error || "Invalid code."); setIsLoading(false); return; }

    if (data.user?.role === "teacher") router.push("/teacher");
    else if (data.user?.role === "student") router.push("/student");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700 flex flex-col">
      <div className="pt-16 pb-8 px-6 text-center text-white">
        <BrandLogo size={64} />
        <h1 className="text-2xl font-bold mt-4">Two-Factor Verification</h1>
        <p className="text-white/70 text-sm mt-1">Enter the code sent to {email}</p>
      </div>

      <div className="flex-1 bg-slate-50 rounded-t-3xl px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          <form onSubmit={handleVerify} className="space-y-3">
            <input
              required maxLength={6} value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="6-digit code"
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm tracking-[0.4em] text-center"
            />
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}
            <button type="submit" disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={null}>
      <Verify2FAForm />
    </Suspense>
  );
}
