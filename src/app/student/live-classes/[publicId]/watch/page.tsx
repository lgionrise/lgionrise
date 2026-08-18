// src/app/student/live-classes/[publicId]/watch/page.tsx
"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { PhoneOff } from "lucide-react";
import { useLiveClassChat } from "@/hooks/use-live-class-chat";
import { ChatDrawer } from "@/components/live-class/chat-drawer";

type ConnectionState = "connecting" | "live" | "reconnecting" | "error";

export default function StudentWatchPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const router = useRouter();
  const videoRef = useRef<HTMLDivElement>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { messages, isConnected, sendMessage } = useLiveClassChat(publicId);
  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [errorMessage, setErrorMessage] = useState("");
  const clientRef = useRef<IAgoraRTCClient | null>(null);

  useEffect(() => {
    let mounted = true;

    async function watchClass() {
      try {
        const tokenRes = await fetch(`/api/student/live-classes/${publicId}/join`, { method: "POST" });
        if (!tokenRes.ok) {
          const errData = await tokenRes.json();
          throw new Error(errData.error || "Could not join the class.");
        }
        const { channel_name, token, app_id, uid } = await tokenRes.json();

        // "audience" role — student subscribes to the teacher's stream only,
        // never publishes their own camera/mic. Matches the backend's
        // "subscriber" role returned for non-teacher join requests.
        const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        clientRef.current = client;
        await client.setClientRole("audience");

        client.on("connection-state-change", (curState) => {
          if (!mounted) return;
          if (curState === "CONNECTED") setConnectionState("live");
          else if (curState === "RECONNECTING") setConnectionState("reconnecting");
        });

        client.on("user-published", async (remoteUser, mediaType) => {
          await client.subscribe(remoteUser, mediaType);
          if (mediaType === "video" && videoRef.current) {
            remoteUser.videoTrack?.play(videoRef.current);
          }
          if (mediaType === "audio") {
            remoteUser.audioTrack?.play();
          }
        });

        await client.join(app_id, channel_name, token, uid);
        if (mounted) setConnectionState("live");
      } catch (err) {
        if (mounted) {
          setConnectionState("error");
          setErrorMessage(err instanceof Error ? err.message : "Failed to join the class.");
        }
      }
    }

    watchClass();

    return () => {
      mounted = false;
      clientRef.current?.leave();
    };
  }, [publicId]);

  const handleLeave = async () => {
    await clientRef.current?.leave();
    await fetch(`/api/student/live-classes/${publicId}/leave`, { method: "POST" });
    router.push("/student/live-classes");
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col z-50">
      <div className="px-6 py-4">
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
          connectionState === "live" ? "bg-red-600 text-white" :
          connectionState === "error" ? "bg-red-900 text-red-200" : "bg-slate-700 text-slate-300"
        }`}>
          {connectionState === "live" && "● Watching Live"}
          {connectionState === "connecting" && "Connecting…"}
          {connectionState === "reconnecting" && "Reconnecting…"}
          {connectionState === "error" && "Connection Error"}
        </span>
      </div>

      <div className="flex-1 relative">
        <div ref={videoRef} className="w-full h-full" />
        {connectionState === "error" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-300 text-sm max-w-sm text-center px-4">{errorMessage}</p>
          </div>
        )}
        {connectionState === "live" && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-slate-600 text-sm">Waiting for teacher&apos;s video...</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center py-6">
        <button onClick={handleLeave} className="bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-full">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
