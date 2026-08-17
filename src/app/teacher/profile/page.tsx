// src/app/teacher/profile/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { TeacherProfileDetail } from "@/types/teacher-profile";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { getErrorMessage } from "@/lib/utils";
import { Loader2, BadgeCheck, X, LogOut } from "lucide-react";

interface AccountInfo { first_name: string; last_name: string; email: string; profile_photo: string | null }

export default function TeacherProfilePage() {
  const router = useRouter();
  const [account, setAccount] = useState<AccountInfo | null>(null);
  const [profile, setProfile] = useState<TeacherProfileDetail | null>(null);
  const [subjectInput, setSubjectInput] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me").then(async (r) => ({ ok: r.ok, status: r.status, data: await r.json() })),
      fetch("/api/teacher/profile").then(async (r) => ({ ok: r.ok, status: r.status, data: await r.json() })),
    ]).then(([meResult, profileResult]) => {
      if (!meResult.ok) {
        setError(`Session error (${meResult.status}): ${meResult.data.detail || meResult.data.reason || "please log in again."}`);
        return;
      }
      if (!profileResult.ok) {
        setError(`Profile load failed (${profileResult.status}): ${profileResult.data.error || "unknown error"}`);
        return;
      }
      setAccount(meResult.data.user);
      setProfile(profileResult.data);
    }).finally(() => setIsLoading(false));
  }, []);

  const handleAvatarUploaded = async (url: string) => {
    const res = await fetch("/api/auth/profile", {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile_photo: url }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(`Could not save photo: ${data.error || `HTTP ${res.status}`}`);  // real reason, not generic text
      return;
    }
    setAccount((prev) => prev ? { ...prev, profile_photo: url } : prev);
    router.refresh();
  };
  
  const addSubject = () => {
    if (!subjectInput.trim() || !profile) return;
    setProfile({ ...profile, subjects: [...profile.subjects, subjectInput.trim()] });
    setSubjectInput("");
  };

  const removeSubject = (index: number) => {
    if (!profile) return;
    setProfile({ ...profile, subjects: profile.subjects.filter((_, i) => i !== index) });
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setError(""); setMessage(""); setIsSaving(true);

    const res = await fetch("/api/teacher/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });
    const data = await res.json();

    if (!res.ok) { setError(getErrorMessage(data.error) || "Failed to save."); setIsSaving(false); return; }
    setMessage("Profile updated.");
    setIsSaving(false);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (isLoading) return <p className="text-slate-500 text-sm p-5">Loading...</p>;
  if (isLoading) return <p className="text-slate-500 text-sm p-5">Loading...</p>;
  if (error) return <p className="text-red-600 text-sm p-5 bg-red-50 rounded-xl m-5">{error}</p>;
  if (!profile || !account) return <p className="text-red-600 text-sm p-5">Could not load profile — unknown reason.</p>;

  return (
    <div className="px-5 pt-8 pb-4 max-w-xl">
      <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-center text-white mb-6">
        <AvatarUpload
          currentUrl={account.profile_photo} firstName={account.first_name} lastName={account.last_name}
          onUploaded={handleAvatarUploaded}
        />
        <h1 className="font-bold text-lg mt-3">{account.first_name} {account.last_name}</h1>
        <p className="text-white/70 text-sm">{account.email}</p>
        {profile.has_verification_badge && (
          <span className="inline-flex items-center gap-1 text-xs font-medium bg-white/20 px-2.5 py-1 rounded-full mt-2">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
          <textarea rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualifications</label>
          <textarea rows={2} value={profile.qualifications} onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Years of Experience</label>
          <input type="number" value={profile.years_of_experience}
            onChange={(e) => setProfile({ ...profile, years_of_experience: parseInt(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Subjects</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {profile.subjects.map((subject, i) => (
              <span key={i} className="flex items-center gap-1.5 bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full">
                {subject}
                <button type="button" onClick={() => removeSubject(i)}><X className="w-3 h-3" /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSubject(); } }}
              placeholder="Add a subject" className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50"
            />
            <button type="button" onClick={addSubject} className="bg-slate-100 text-slate-700 text-sm font-medium px-4 rounded-xl">Add</button>
          </div>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <input type="checkbox" checked={profile.is_profile_visible}
            onChange={(e) => setProfile({ ...profile, is_profile_visible: e.target.checked })}
            className="rounded border-slate-300 text-indigo-600" />
          Make profile visible to students
        </label>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3.5 py-2.5">{error}</p>}
        {message && <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3.5 py-2.5">{message}</p>}

        <button type="submit" disabled={isSaving}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl text-sm flex items-center justify-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Profile
        </button>
      </form>

      <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-600 font-medium text-sm mt-4 py-3">
        <LogOut className="w-4 h-4" /> Logout
      </button>
    </div>
  );
}
