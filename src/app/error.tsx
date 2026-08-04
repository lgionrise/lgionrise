// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("App crash caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="text-center max-w-md">
        <div className="bg-red-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
        <p className="text-sm text-slate-500 mt-2 break-words">{error.message || "Unknown error"}</p>
        {error.digest && <p className="text-xs text-slate-400 mt-1">Error ID: {error.digest}</p>}
        <button
          onClick={reset}
          className="mt-6 flex items-center gap-2 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    </div>
  );
}
