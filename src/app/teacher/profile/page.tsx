// src/app/teacher/profile/page.tsx
"use client";

import { useState, useEffect, FormEvent } from "react";
import { TeacherProfileDetail } from "@/types/teacher-profile";
import { getErrorMessage } from "@/lib/utils";
import { Loader2, BadgeCheck, X } from "lucide-react";

export default function TeacherProfilePage() {
  const [profile, setProfile] = useState<TeacherProfileDetail | null>(null);
  const [subjectInput, setSubjectInput] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/teacher/profile")
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .finally(() => setIsLoading(false));
  }, []);

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

  if (isLoading) return <p className="text-slate-500 text-sm">Loading...</p>;
  if (!profile) return <p className="text-red-600 text-sm">Could not load profile.</p>;

  return (
    <div className="max-w-xl">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-xl font-semibold text-slate-900">Professional Profile</h1>
        {profile.has_verification_badge && (
          <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            <BadgeCheck className="w-3.5 h-3.5" /> Verified
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Bio</label>
          <textarea
            rows={3} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Qualifications</label>
          <textarea
            rows={2} value={profile.qualifications} onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Years of Experience</label>
          <input
            type="number" value={profile.years_of_experience}
            onChange={(e) => setProfile({ ...profile, years_of_experience: parseInt(e.target.value) || 0 })}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
          />
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
              placeholder="Add a subject and press Enter"
              className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-sm"
            />
            <button type="button" onClick={addSubject} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium px-4 rounded-lg">
              Add
            </button>
          </div>
        </div>

        {[
          { key: "video_intro_url" as const, label: "Video Intro URL" },
          { key: "youtube_url" as const, label: "YouTube URL" },
          { key: "linkedin_url" as const, label: "LinkedIn URL" },
          { key: "other_social_url" as const, label: "Other Social URL" },
        ].map((field) => (
          <div key={field.key}>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">{field.label}</label>
            <input
              value={profile[field.key]} onChange={(e) => setProfile({ ...profile, [field.key]: e.target.value })}
              className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm"
            />
          </div>
        ))}

        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox" checked={profile.is_profile_visible}
            onChange={(e) => setProfile({ ...profile, is_profile_visible: e.target.checked })}
            className="rounded border-slate-300 text-indigo-600"
          />
          Make profile visible to students
        </label>

        {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        {message && <p className="text-sm text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">{message}</p>}

        <button type="submit" disabled={isSaving}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium px-6 py-2.5 rounded-lg text-sm flex items-center gap-2">
          {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
          Save Profile
        </button>
      </form>
    </div>
  );
}