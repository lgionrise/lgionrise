// src/app/teacher/live-classes/[publicId]/host/page.tsx
"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Megaphone } from "lucide-react";

type ConnectionState = "connecting" | "live" | "reconnecting" | "error";

export default function LiveClassHostPage({ params }: { params: Promise < { publicId: string } > }) {
  const { publicId } = use(params);
  const router = useRouter();
  const videoRef = useRef < HTMLDivElement > (null);
  
  const [connectionState, setConnectionState] = useState < ConnectionState > ("connecting");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [announceText, setAnnounceText] = useState("");
  
  const clientRef = useRef < IAgoraRTCClient | null > (null);
  const localVideoTrackRef = useRef < ICameraVideoTrack | null > (null);
  const localAudioTrackRef = useRef < IMicrophoneAudioTrack | null > (null);
  
  useEffect(() => {
    let mounted = true;
    
    async function startClass() {
      try {
        const tokenRes = await fetch(`/api/teacher/live-classes/${publicId}/join`, { method: "POST" });
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
        
        if (videoRef.current) {
          videoTrack.play(videoRef.current);
        }
        
        await client.publish([audioTrack, videoTrack]);
        
        if (mounted) setConnectionState("live");
      } catch (err) {
        console.error(err);
        if (mounted) {
          setConnectionState("error");
          setErrorMessage(err instanceof Error ? err.message : "Failed to start the class. Check camera/mic permissions.");
        }
      }
    }
    
    startClass();
    
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
  
  const handleAnnounce = async () => {
    if (!announceText.trim()) return;
    await fetch(`/api/teacher/live-classes/${publicId}/announcements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: announceText }),
    });
    setAnnounceText("");
    setShowAnnounce(false);
  };
  
  const handleEndClass = async () => {
    localAudioTrackRef.current?.close();
    localVideoTrackRef.current?.close();
    await clientRef.current?.leave();
    await fetch(`/api/teacher/live-classes/${publicId}/end`, { method: "POST" });
    router.push(`/teacher/live-classes/${publicId}`);
  };
  
  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <span
          className={`text-xs font-medium px-3 py-1 rounded-full ${
            connectionState === "live" ? "bg-red-600 text-white" :
            connectionState === "error" ? "bg-red-900 text-red-200" : "bg-slate-700 text-slate-300"
          }`}
        >
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

      {showAnnounce && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-xl p-4 w-full max-w-sm mx-4">
          <textarea
            value={announceText} onChange={(e) => setAnnounceText(e.target.value)} rows={2}
            placeholder="Announcement message..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2"
          />
          <div className="flex gap-2">
            <button onClick={handleAnnounce} className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Send</button>
            <button onClick={() => setShowAnnounce(false)} className="text-slate-500 text-sm font-medium px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-4 py-6">
        <button onClick={toggleMic} className="bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-full">
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={toggleCamera} className="bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-full">
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
        </button>
        <button onClick={() => setShowAnnounce(true)} className="bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-full">
          <Megaphone className="w-5 h-5" />
        </button>
        <button onClick={handleEndClass} className="bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-full">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}