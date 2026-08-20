// src/app/register/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, UserRound, BookOpenCheck } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { PasswordInput } from "@/components/ui/password-input";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", username: "", password: "", role: "student" as "student" | "teacher",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(async (r) => {
      if (!r.ok) return;
      const data = await r.json();
      if (data.user?.role === "teacher") router.replace("/teacher");
      else if (data.user?.role === "student") router.replace("/student");
    }).finally(() => setIsCheckingSession(false));
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) { setError(data.error || "Registration failed."); setIsLoading(false); return; }

    // Account created — send an OTP to verify the email before letting them in.
    await fetch("/api/auth/otp/request", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier: form.email, purpose: "signup" }),
    });

    router.push(`/verify-email?email=${encodeURIComponent(form.email)}&password=${encodeURIComponent(form.password)}&role=${form.role}`);
  };

  if (isCheckingSession) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-600 to-violet-700 flex flex-col">
      <div className="pt-14 pb-8 px-6 text-center text-white">
        <BrandLogo size={64} />
        <h1 className="text-2xl font-bold mt-4">Create your account</h1>
        <p className="text-white/70 text-sm mt-1">Join Learn and Grow today</p>
      </div>

      <div className="flex-1 bg-slate-50 rounded-t-3xl px-6 pt-8 pb-10">
        <div className="max-w-sm mx-auto">
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button type="button" onClick={() => setForm({ ...form, role: "student" })}
              className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border-2", form.role === "student" ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white")}>
              <UserRound className={cn("w-6 h-6", form.role === "student" ? "text-indigo-600" : "text-slate-400")} />
              <span className={cn("text-sm font-semibold", form.role === "student" ? "text-indigo-600" : "text-slate-600")}>Student</span>
            </button>
            <button type="button" onClick={() => setForm({ ...form, role: "teacher" })}
              className={cn("flex flex-col items-center gap-2 p-4 rounded-2xl border-2", form.role === "teacher" ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white")}>
              <BookOpenCheck className={cn("w-6 h-6", form.role === "teacher" ? "text-indigo-600" : "text-slate-400")} />
              <span className={cn("text-sm font-semibold", form.role === "teacher" ? "text-indigo-600" : "text-slate-600")}>Teacher</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="First name" value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm" />
              <input required placeholder="Last name" value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                className="px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm" />
            </div>
            <input required type="email" placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm" />
            <input required placeholder="Username" value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-sm" />
            <PasswordInput value={form.password} onChange={(v) => setForm({ ...form, password: v })} />

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}

            <button type="submit" disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 mt-2 shadow-lg shadow-indigo-200">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account? <Link href="/login" className="text-indigo-600 font-semibold">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
