// src/app/teacher/manage-teachers/add/page.tsx
"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function AddTeacherPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "", phone_number: "", username: "", password: "", first_name: "", last_name: "", auto_approve: false,
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(""); setIsLoading(true);

    const res = await fetch("/api/teacher/manage-teachers/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) { setError(getErrorMessage(data.error) || "Failed to create teacher account."); setIsLoading(false); return; }
    router.push("/teacher/manage-teachers");
  };

  return (
    <div className="max-w-md">
      <h1 className="text-xl font-semibold text-slate-900 mb-6">Add Teacher</h1>
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <input required placeholder="First name" value={form.first_name}
            onChange={(e) => setForm({ ...form, first_name: e.target.value })}
            className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
          <input required placeholder="Last name" value={form.last_name}
            onChange={(e) => setForm({ ...form, last_name: e.target.value })}
            className="px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        </div>
        <input required type="email" placeholder="Email" value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        <input placeholder="Phone number" value={form.phone_number}
          onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        <input required placeholder="Username" value={form.username}
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />
        <input required type="password" placeholder="Temporary password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm" />

        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <input type="checkbox" checked={form.auto_approve}
            onChange={(e) => setForm({ ...form, auto_approve: e.target.checked })}
            className="rounded border-slate-300 text-indigo-600" />
          Auto-approve this teacher immediately
        </label>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <button type="submit" disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm flex items-center gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Create Teacher Account
        </button>
      </form>
    </div>
  );
}
