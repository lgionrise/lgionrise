// src/app/teacher/tuition/bookings/[publicId]/session/page.tsx
"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff } from "lucide-react";

type ConnectionState = "connecting" | "live" | "reconnecting" | "error";

export default function TuitionSessionPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const router = useRouter();
  const videoRef = useRef<HTMLDivElement>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  useEffect(() => {
    let mounted = true;

    async function startSession() {
      try {
        const tokenRes = await fetch(`/api/teacher/tuition/bookings/${publicId}/join`, { method: "POST" });
        if (!tokenRes.ok) throw new Error("Could not get join token from server.");
        const { channel_name, token, app_id, uid } = await tokenRes.json();

        const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        clientRef.current = client;
        await client.setClientRole("host");

        client.on("connection-state-change", (curState) => {
          if (!mounted) return;
          if (curState === "CONNECTED") setConnectionState("live");
          else if (curState === "RECONNECTING") setConnectionState("reconnecting");
        });

        await client.join(app_id, channel_name, token, uid);

        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
        localAudioTrackRef.current = audioTrack;
        localVideoTrackRef.current = videoTrack;
        if (videoRef.current) videoTrack.play(videoRef.current);
        await client.publish([audioTrack, videoTrack]);

        if (mounted) setConnectionState("live");
      } catch (err) {
        if (mounted) {
          setConnectionState("error");
          setErrorMessage(err instanceof Error ? err.message : "Failed to start session.");
        }
      }
    }

    startSession();

    return () => {
      mounted = false;
      localAudioTrackRef.current?.close();
      localVideoTrackRef.current?.close();
      clientRef.current?.leave();
    };
  }, [publicId]);

  const toggleMic = async () => {
    if (!localAudioTrackRef.current) return;
    await localAudioTrackRef.current.setEnabled(isMuted);
    setIsMuted(!isMuted);
  };

  const toggleCamera = async () => {
    if (!localVideoTrackRef.current) return;
    await localVideoTrackRef.current.setEnabled(isCameraOff);
    setIsCameraOff(!isCameraOff);
  };

  const handleLeave = async () => {
    localAudioTrackRef.current?.close();
    localVideoTrackRef.current?.close();
    await clientRef.current?.leave();
    router.push("/teacher/tuition/bookings");
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col z-50">
      <div className="px-6 py-4">
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${connectionState === "live" ? "bg-red-600 text-white" : "bg-slate-700 text-slate-300"}`}>
          {connectionState === "live" && "● Live"}
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
      </div>

      <div className="flex items-center justify-center gap-4 py-6">
        <button onClick={toggleMic} className="bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-full">
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={toggleCamera} className="bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-full">
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
        </button>
        <button onClick={handleLeave} className="bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-full">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}