// src/app/teacher/error.tsx
"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function TeacherError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error("Teacher section crash:", error); }, [error]);

  return (
    <div className="p-8 text-center">
      <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
      <p className="font-medium text-slate-900">This page hit an error</p>
      <p className="text-sm text-slate-500 mt-1 break-words">{error.message}</p>
      <button onClick={reset} className="mt-4 flex items-center gap-2 mx-auto bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg">
        <RefreshCw className="w-4 h-4" /> Retry
      </button>
    </div>
  );
}
