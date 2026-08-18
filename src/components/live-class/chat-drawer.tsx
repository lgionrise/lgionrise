// src/components/live-class/chat-drawer.tsx
"use client";

import { useState } from "react";
import { X, Send, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatMsg { public_id: string; sender_name: string; is_from_teacher: boolean; content: string }

export function ChatDrawer({
  messages, isConnected, onSend, isOpen, onClose, onToggle,
}: {
  messages: ChatMsg[]; isConnected: boolean; onSend: (text: string) => void;
  isOpen: boolean; onClose: () => void; onToggle: () => void;
}) {
  const [text, setText] = useState("");

  if (!isOpen) {
    return (
      <button onClick={onToggle} className="bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-full relative">
        <MessageCircle className="w-5 h-5" />
        {!isConnected && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full" />}
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center sm:justify-center" onClick={onClose}>
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm h-[70vh] sm:h-[500px] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold">Class Chat {!isConnected && <span className="text-xs text-amber-500">(connecting...)</span>}</p>
          <button onClick={onClose}><X className="w-4 h-4 text-slate-400" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.map((m) => (
            <div key={m.public_id} className={cn("flex", m.is_from_teacher ? "justify-start" : "justify-end")}>
              <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2 text-sm", m.is_from_teacher ? "bg-indigo-50 text-indigo-900" : "bg-slate-100")}>
                {m.is_from_teacher && <p className="text-[10px] font-semibold text-indigo-600 mb-0.5">{m.sender_name}</p>}
                {m.content}
              </div>
            </div>
          ))}
          {messages.length === 0 && <p className="text-xs text-slate-400 text-center pt-4">No messages yet</p>}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); if (text.trim()) { onSend(text); setText(""); } }}
          className="flex gap-2 p-3 border-t border-slate-100"
        >
          <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..."
            className="flex-1 px-3.5 py-2 border border-slate-200 rounded-xl text-sm" />
          <button type="submit" className="bg-indigo-600 text-white p-2.5 rounded-xl"><Send className="w-4 h-4" /></button>
        </form>
      </div>
    </div>
  );
}
