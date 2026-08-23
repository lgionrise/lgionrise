// src/app/student/live-classes/[publicId]/watch/page.tsx — poori file replace karo
"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Hand } from "lucide-react";
import { useLiveClassChat } from "@/hooks/use-live-class-chat";
import { ChatDrawer } from "@/components/live-class/chat-drawer";

type ConnectionState = "connecting" | "live" | "reconnecting" | "error";

export default function StudentWatchPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const router = useRouter();
  const videoRef = useRef<HTMLDivElement>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [errorMessage, setErrorMessage] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [className, setClassName] = useState("");
  const [micAllowed, setMicAllowed] = useState(false);
  const [cameraAllowed, setCameraAllowed] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const isPublisherRef = useRef(false);

  const { messages, isConnected, sendMessage, sendSignal } = useLiveClassChat(publicId);

  useEffect(() => {
    fetch(`/api/student/live-classes/${publicId}/detail`).then((r) => r.json()).then((d) => {
      setClassName(d.title || "");
      setMicAllowed(!!d.student_mic_allowed);
      setCameraAllowed(!!d.student_camera_allowed);
    });
  }, [publicId]);

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
          if (mediaType === "video" && videoRef.current) remoteUser.videoTrack?.play(videoRef.current);
          if (mediaType === "audio") remoteUser.audioTrack?.play();
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
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      clientRef.current?.leave();
    };
  }, [publicId]);

  const becomePublisherIfNeeded = async () => {
    const client = clientRef.current;
    if (!client || isPublisherRef.current) return;
    await client.setClientRole("host");
    isPublisherRef.current = true;
  };

  const toggleMic = async () => {
    if (!micAllowed) return;
    try {
      await becomePublisherIfNeeded();
      if (!localAudioTrackRef.current) {
        localAudioTrackRef.current = await AgoraRTC.createMicrophoneAudioTrack();
        await clientRef.current?.publish(localAudioTrackRef.current);
        setMicOn(true);
        return;
      }
      await localAudioTrackRef.current.setEnabled(!micOn);
      setMicOn(!micOn);
    } catch (err) {
      console.error("Mic toggle failed:", err);
    }
  };

  const toggleCamera = async () => {
    if (!cameraAllowed) return;
    try {
      await becomePublisherIfNeeded();
      if (!localVideoTrackRef.current) {
        localVideoTrackRef.current = await AgoraRTC.createCameraVideoTrack();
        await clientRef.current?.publish(localVideoTrackRef.current);
        setCameraOn(true);
        return;
      }
      await localVideoTrackRef.current.setEnabled(!cameraOn);
      setCameraOn(!cameraOn);
    } catch (err) {
      console.error("Camera toggle failed:", err);
    }
  };

  const raiseHand = () => {
    sendSignal("raise_hand");
    setHandRaised(true);
    setTimeout(() => setHandRaised(false), 5000);
  };

  const handleLeave = async () => {
    localAudioTrackRef.current?.close();
    localVideoTrackRef.current?.close();
    await clientRef.current?.leave();
    await fetch(`/api/student/live-classes/${publicId}/leave`, { method: "POST" });
    router.push("/student/live-classes");
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col z-50">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-white text-sm font-semibold truncate max-w-[200px]">{className}</p>
          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${
            connectionState === "live" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-300"
          }`}>
            {connectionState === "live" && "● Live"}
            {connectionState === "connecting" && "Connecting…"}
            {connectionState === "reconnecting" && "Reconnecting…"}
            {connectionState === "error" && "Connection Error"}
          </span>
        </div>
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

      <div className="flex items-center justify-center gap-2.5 py-5 flex-wrap px-3 bg-gradient-to-t from-black/60 to-transparent">
        {micAllowed && (
          <button onClick={toggleMic} className={`p-3.5 rounded-full shrink-0 ${micOn ? "bg-indigo-600" : "bg-slate-800"} text-white`}>
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>
        )}
        {cameraAllowed && (
          <button onClick={toggleCamera} className={`p-3.5 rounded-full shrink-0 ${cameraOn ? "bg-indigo-600" : "bg-slate-800"} text-white`}>
            {cameraOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>
        )}
        <button onClick={raiseHand} className={`p-3.5 rounded-full shrink-0 ${handRaised ? "bg-amber-500" : "bg-slate-800"} text-white`}>
          <Hand className="w-5 h-5" />
        </button>
        <ChatDrawer messages={messages} isConnected={isConnected} onSend={sendMessage}
          isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onToggle={() => setIsChatOpen(true)} />
        <button onClick={handleLeave} className="bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-full shrink-0">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
