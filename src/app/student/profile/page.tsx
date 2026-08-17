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
    const res = await fetch("/api/auth/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile_photo: url }),
    });
    const data = await res.json();
    if (!res.ok) { alert(`Could not save photo: ${data.error || `HTTP ${res.status}`}`); return; }
    setAccount((prev) => prev ? { ...prev, profile_photo: url } : prev);
    router.refresh();
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (!account) return <p className="text-slate-500 text-sm p-5 pt-24">Loading...</p>;

  return (
    <div className="w-full max-w-xl mx-auto px-4 pt-24 pb-24 lg:pb-8 overflow-x-hidden">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-5 text-center text-white mb-5 w-full">
        <AvatarUpload
          currentUrl={account.profile_photo} firstName={account.first_name} lastName={account.last_name}
          onUploaded={handleAvatarUploaded}
        />
        <h1 className="font-bold text-base mt-3 break-words px-2">{account.first_name} {account.last_name}</h1>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 mb-4 w-full">
        <div className="flex items-center gap-3 px-4 py-3.5 min-w-0">
          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-700 truncate">{account.email}</span>
        </div>
        <div className="flex items-center gap-3 px-4 py-3.5 min-w-0">
          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-sm text-slate-700 truncate">{account.phone_number || "Not added"}</span>
        </div>
      </div>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-600 font-medium text-sm py-3">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );
}
