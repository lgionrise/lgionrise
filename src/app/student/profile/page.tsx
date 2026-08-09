// src/app/student/profile/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { LogOut, Mail, Phone } from "lucide-react";

interface AccountInfo { first_name: string; last_name: string; email: string; phone_number: string | null; profile_photo: string | null }

export default function StudentProfilePage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((data) => setAccount(data.user));
  }, []);

  const handleAvatarUploaded = async (url: string) => {
    await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile_photo: url }),
    });
    setAccount((prev) => prev ? { ...prev, profile_photo: url } : prev);
    router.refresh();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (!account) return <p className="text-slate-500 text-sm p-5">Loading...</p>;

  return (
    <div className="px-5 pt-8 pb-4 max-w-xl">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-center text-white mb-6">
        <AvatarUpload
          currentUrl={account.profile_photo} firstName={account.first_name} lastName={account.last_name}
          onUploaded={handleAvatarUploaded}
        />
        <h1 className="font-bold text-lg mt-3">{account.first_name} {account.last_name}</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 mb-4">
        <div className="flex items-center gap-3 px-5 py-4">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-700">{account.email}</span>
        </div>
        <div className="flex items-center gap-3 px-5 py-4">
          <Phone className="w-4 h-4 text-slate-400" />
          <span className="text-sm text-slate-700">{account.phone_number || "Not added"}</span>
        </div>
      </div>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-600 font-medium text-sm py-3">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );
}
