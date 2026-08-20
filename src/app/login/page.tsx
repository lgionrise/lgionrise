// src/app/login/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { PasswordInput } from "@/components/ui/password-input";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(async (r) => {
        if (!r.ok) return;
        const data = await r.json();
        if (data.user?.role === "teacher") router.replace("/teacher");
        else if (data.user?.role === "student") router.replace("/student");
      })
      .finally(() => setIsCheckingSession(false));
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error || "Login failed."); setIsLoading(false); return; }

    // Strict check first — 2FA response never includes a user object, so
    // checking role before this was the bug: if requires_2fa was somehow
    // falsy/missing, data.user would be undefined and fall through to the
    // "unsupported account type" error even for a valid student/teacher.
    if (data.requires_2fa === true) {
      router.push(`/login/verify-2fa?email=${encodeURIComponent(email)}`);
      return;
    }

    if (data.user?.role === "teacher") { router.push("/teacher"); router.refresh(); return; }
    if (data.user?.role === "student") { router.push("/student"); router.refresh(); return; }

    console.error("Unexpected login response — no 2FA flag and no valid role:", data);
    setError("Login succeeded but the account type couldn't be determined. Please contact support.");
    setIsLoading(false);
  };

  if (isCheckingSession) return null; // avoids a flash of the login form before the redirect check finishes

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700 flex flex-col">
      <div className="pt-16 pb-8 px-6 text-center text-white">
        <BrandLogo size={64} />
        <h1 className="text-2xl font-bold mt-4">Welcome back</h1>
        <p className="text-white/70 text-sm mt-1">Log in to continue learning</p>
      </div>

      <div className="flex-1 bg-slate-50 rounded-t-3xl px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="email" required placeholder="Email address" value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm"
            />
            <PasswordInput value={password} onChange={setPassword} />
            <div className="text-right">
              <Link href="/forgot-password" className="text-xs font-medium text-indigo-600">Forgot password?</Link>
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}
            <button
              type="submit" disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-200"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Sign In
            </button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Don&apos;t have an account? <Link href="/register" className="text-indigo-600 font-semibold">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
