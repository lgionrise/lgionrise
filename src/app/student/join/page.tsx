// src/app/student/join/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentJoinPage() {
  const router = useRouter();
  const [classId, setClassId] = useState("");

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (classId.trim()) {
      router.push(`/student/live-classes/${classId.trim()}`);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("lgion_access_token");
    localStorage.removeItem("lgion_refresh_token");
    router.push("/student-login");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <button 
        onClick={handleLogout}
        className="absolute top-4 right-4 text-sm text-gray-500 hover:text-red-600"
      >
        Logout
      </button>

      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Live Class</h2>
        <p className="text-gray-500 mb-6 text-sm">Enter the Live Class ID provided by your teacher</p>

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none text-center font-mono text-lg tracking-wider"
            placeholder="e.g., 123e4567-e89b..."
          />
          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Join Class
          </button>
        </form>
      </div>
    </div>
  );
}
