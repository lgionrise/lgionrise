// src/components/teacher/pending-approval-screen.tsx
"use client";

import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

export function PendingApprovalScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="bg-amber-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h1 className="text-xl font-semibold text-slate-900">Account Pending Approval</h1>
        <p className="text-slate-500 mt-2">
          Your teacher account is awaiting admin approval. You&apos;ll get access as soon as it&apos;s approved.
        </p>
        <button onClick={handleLogout} className="mt-6 text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Log out
        </button>
      </div>
    </div>
  );
}