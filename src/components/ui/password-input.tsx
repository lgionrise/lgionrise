// src/components/ui/password-input.tsx
"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export function PasswordInput({
  value, onChange, placeholder = "Password", required = true,
}: { value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        type={visible ? "text" : "password"} required={required} value={value}
        onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className="w-full px-4 py-3 pr-11 rounded-xl bg-white border border-slate-200 text-sm"
      />
      <button
        type="button" onClick={() => setVisible(!visible)}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      >
        {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
