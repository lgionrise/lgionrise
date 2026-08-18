// src/hooks/use-live-class-chat.ts
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface ChatMsg { public_id: string; sender_name: string; is_from_teacher: boolean; content: string; created_at: string }
type SignalHandler = (type: string, senderName: string) => void;

export function useLiveClassChat(classPublicId: string, onSignal?: SignalHandler) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let ws: WebSocket;

    (async () => {
      const res = await fetch("/api/ws-token");
      if (!res.ok) return;
      const { token } = await res.json();

      const wsBase = process.env.NEXT_PUBLIC_WS_BASE_URL || "wss://api.lgion.qalbconverfy.in";
      ws = new WebSocket(`${wsBase}/ws/live-class/${classPublicId}/?token=${token}`);
      wsRef.current = ws;

      ws.onopen = () => setIsConnected(true);
      ws.onclose = () => setIsConnected(false);
      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        if (payload.type === "chat_message") {
          setMessages((prev) => [...prev, payload]);
        } else {
          onSignal?.(payload.type, payload.sender_name);
        }
      };
    })();

    return () => wsRef.current?.close();
  }, [classPublicId]);

  const sendMessage = useCallback((content: string) => {
    wsRef.current?.send(JSON.stringify({ type: "chat_message", content }));
  }, []);

  const sendSignal = useCallback((type: string) => {
    wsRef.current?.send(JSON.stringify({ type }));
  }, []);

  return { messages, isConnected, sendMessage, sendSignal };
}
