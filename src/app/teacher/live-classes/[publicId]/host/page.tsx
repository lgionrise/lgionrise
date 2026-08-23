// src/app/teacher/live-classes/[publicId]/host/page.tsx — poori file replace karo
"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Megaphone, MonitorUp, Monitor, RefreshCw } from "lucide-react";
import { useLiveClassChat } from "@/hooks/use-live-class-chat";
import { ChatDrawer } from "@/components/live-class/chat-drawer";
import { Hand } from "lucide-react";

type ConnectionState = "connecting" | "live" | "reconnecting" | "error";

export default function LiveClassHostPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const router = useRouter();
  const videoRef = useRef<HTMLDivElement>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>("connecting");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [showAnnounce, setShowAnnounce] = useState(false);
  const [announceText, setAnnounceText] = useState("");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [handRaisedBy, setHandRaisedBy] = useState<string | null>(null);
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const screenTrackRef = useRef<any>(null);
  const cameraDevicesRef = useRef<MediaDeviceInfo[]>([]);
  const currentCameraIndexRef = useRef(0);

  const { messages, isConnected, sendMessage } = useLiveClassChat(publicId, (type, senderName) => {
    if (type === "raise_hand") {
      setHandRaisedBy(senderName);
      setTimeout(() => setHandRaisedBy(null), 6000);
    }
  });

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

        if (videoRef.current) videoTrack.play(videoRef.current);
        await client.publish([audioTrack, videoTrack]);

        // Enumerate camera devices so "Switch Camera" (front/back) has something to cycle through
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          cameraDevicesRef.current = devices.filter((d) => d.kind === "videoinput");
        } catch {
          cameraDevicesRef.current = [];
        }

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
      screenTrackRef.current?.close();
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

  const switchCamera = async () => {
    const track = localVideoTrackRef.current;
    const devices = cameraDevicesRef.current;
    if (!track || devices.length < 2) return; // nothing to switch to (e.g. desktop with one webcam)

    currentCameraIndexRef.current = (currentCameraIndexRef.current + 1) % devices.length;
    const nextDevice = devices[currentCameraIndexRef.current];
    try {
      await track.setDevice(nextDevice.deviceId);
    } catch (err) {
      console.error("Camera switch failed:", err);
    }
  };

  const stopScreenShare = async () => {
    const client = clientRef.current;
    if (!client || !screenTrackRef.current) return;
    await client.unpublish(screenTrackRef.current);
    screenTrackRef.current.close();
    screenTrackRef.current = null;
    if (localVideoTrackRef.current && videoRef.current) {
      localVideoTrackRef.current.play(videoRef.current);
      await client.publish(localVideoTrackRef.current);
    }
    setIsSharingScreen(false);
  };

  const toggleScreenShare = async () => {
    const client = clientRef.current;
    if (!client) return;

    if (!isSharingScreen) {
      try {
        const screenTrack = await AgoraRTC.createScreenVideoTrack({ encoderConfig: "1080p_1" }, "disable");
        screenTrackRef.current = screenTrack;
        if (localVideoTrackRef.current) await client.unpublish(localVideoTrackRef.current);
        if (videoRef.current) (screenTrack as any).play(videoRef.current);
        await client.publish(screenTrack);
        setIsSharingScreen(true);
        (screenTrack as any).on("track-ended", () => stopScreenShare());
      } catch (err) {
        console.error("Screen share failed or was cancelled:", err);
      }
    } else {
      stopScreenShare();
    }
  };

  const handleAnnounce = async () => {
    if (!announceText.trim()) return;
    await fetch(`/api/teacher/live-classes/${publicId}/announcements`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: announceText }),
    });
    setAnnounceText("");
    setShowAnnounce(false);
  };

  const handleEndClass = async () => {
    localAudioTrackRef.current?.close();
    localVideoTrackRef.current?.close();
    screenTrackRef.current?.close();
    await clientRef.current?.leave();
    await fetch(`/api/teacher/live-classes/${publicId}/end`, { method: "POST" });
    router.push(`/teacher/live-classes/${publicId}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col z-50">
      <div className="flex items-center justify-between px-6 py-4">
        <span className={`text-xs font-medium px-3 py-1 rounded-full ${
          connectionState === "live" ? "bg-red-600 text-white" :
          connectionState === "error" ? "bg-red-900 text-red-200" : "bg-slate-700 text-slate-300"
        }`}>
          {connectionState === "live" && "● Live"}
          {connectionState === "connecting" && "Connecting…"}
          {connectionState === "reconnecting" && "Reconnecting…"}
          {connectionState === "error" && "Connection Error"}
        </span>
        {isSharingScreen && <span className="text-xs font-medium px-3 py-1 rounded-full bg-emerald-600 text-white">Sharing Screen</span>}
      </div>

      {handRaisedBy && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2 z-20">
          <Hand className="w-4 h-4" /> {handRaisedBy} raised their hand
        </div>
      )}

      <div className="flex-1 relative">
        <div ref={videoRef} className="w-full h-full" />
        {connectionState === "error" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-300 text-sm max-w-sm text-center px-4">{errorMessage}</p>
          </div>
        )}
      </div>

      {showAnnounce && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-xl p-4 w-full max-w-sm mx-4 z-20">
          <textarea value={announceText} onChange={(e) => setAnnounceText(e.target.value)} rows={2}
            placeholder="Announcement message..." className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2" />
          <div className="flex gap-2">
            <button onClick={handleAnnounce} className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg">Send</button>
            <button onClick={() => setShowAnnounce(false)} className="text-slate-500 text-sm font-medium px-4 py-2">Cancel</button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center gap-2.5 py-5 flex-wrap px-3">
        <button onClick={toggleMic} className="bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-full shrink-0">
          {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
        </button>
        <button onClick={toggleCamera} className="bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-full shrink-0">
          {isCameraOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
        </button>
        <button onClick={switchCamera} className="bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-full shrink-0">
          <RefreshCw className="w-5 h-5" />
        </button>
        <button onClick={toggleScreenShare} className={`p-3.5 rounded-full text-white shrink-0 ${isSharingScreen ? "bg-emerald-600" : "bg-slate-800 hover:bg-slate-700"}`}>
          {isSharingScreen ? <Monitor className="w-5 h-5" /> : <MonitorUp className="w-5 h-5" />}
        </button>
        <button onClick={() => setShowAnnounce(true)} className="bg-slate-800 hover:bg-slate-700 text-white p-3.5 rounded-full shrink-0">
          <Megaphone className="w-5 h-5" />
        </button>
        <ChatDrawer messages={messages} isConnected={isConnected} onSend={sendMessage}
          isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} onToggle={() => setIsChatOpen(true)} />
        <button onClick={handleEndClass} className="bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-full shrink-0">
          <PhoneOff className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
