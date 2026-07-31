// src/app/teacher/live-classes/[publicId]/host/page.tsx
"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC, { IAgoraRTCClient, ICameraVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { Mic, MicOff, Video as VideoIcon, VideoOff, PhoneOff, Megaphone, Camera, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

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
  
  // Camera Switching States
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>("");
  const [showCameraMenu, setShowCameraMenu] = useState(false);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localVideoTrackRef = useRef<ICameraVideoTrack | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  // 1. Fetch available cameras on mount
  useEffect(() => {
    let mounted = true;
    async function getCameras() {
      try {
        // Request permission first so browser shows actual camera names
        await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const devices = await AgoraRTC.getCameras();
        if (mounted) {
          setCameras(devices);
          if (devices.length > 0 && !selectedCameraId) {
            setSelectedCameraId(devices[0].deviceId);
          }
        }
      } catch (err) {
        console.error("Camera permission denied or not available:", err);
      }
    }
    getCameras();
    return () => { mounted = false; };
  }, []);

  // 2. Start Class Logic
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

        // ✅ FIXED: Agora expects (audioConfig, videoConfig) as two separate arguments
        const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks(
          undefined, // Audio config (keep default)
          selectedCameraId ? { deviceId: { exact: selectedCameraId } } : undefined // Video config
        );

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
          setErrorMessage(err instanceof Error ? err.message : "Failed to start class. Check camera/mic permissions.");
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
  }, [publicId, selectedCameraId]);

  // 3. Toggle Mic
  const toggleMic = async () => {
    if (!localAudioTrackRef.current) return;
    await localAudioTrackRef.current.setEnabled(isMuted);
    setIsMuted(!isMuted);
  };

  // 4. Toggle Camera (On/Off)
  const toggleCamera = async () => {
    if (!localVideoTrackRef.current) return;
    await localVideoTrackRef.current.setEnabled(isCameraOff);
    setIsCameraOff(!isCameraOff);
  };

  // 5. 🌟 SWITCH CAMERA LOGIC
  const switchCamera = async (newDeviceId: string) => {
    if (!clientRef.current || !localVideoTrackRef.current) return;

    try {
      setConnectionState("reconnecting");
      
      // Step A: Unpublish and close the old video track
      await clientRef.current.unpublish(localVideoTrackRef.current);
      localVideoTrackRef.current.close();

      // ✅ FIXED: Removed 'cameraConfig' wrapper, passed deviceId directly to video config
      const newVideoTrack = await AgoraRTC.createCameraVideoTrack({
        deviceId: { exact: newDeviceId }
      });
      localVideoTrackRef.current = newVideoTrack;

      // Step C: Play the new track and publish it to Agora
      if (videoRef.current) {
        newVideoTrack.play(videoRef.current);
      }
      await clientRef.current.publish(newVideoTrack);

      setSelectedCameraId(newDeviceId);
      setShowCameraMenu(false);
      setConnectionState("live");
    } catch (err) {
      console.error("Failed to switch camera:", err);
      setErrorMessage("Failed to switch camera. Please check permissions.");
    }
  };

  // 6. Quick Flip (For Mobile)
  const quickFlipCamera = () => {
    if (cameras.length < 2) return;
    const currentIndex = cameras.findIndex(cam => cam.deviceId === selectedCameraId);
    const nextIndex = (currentIndex + 1) % cameras.length;
    switchCamera(cameras[nextIndex].deviceId);
  };

  // 7. Announcement & End Class
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
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900/80 backdrop-blur-sm">
        <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 ${
          connectionState === "live" ? "bg-red-600 text-white animate-pulse" :
          connectionState === "error" ? "bg-red-900 text-red-200" : "bg-slate-700 text-slate-300"
        }`}>
          {connectionState === "live" && <span className="w-2 h-2 bg-white rounded-full" />}
          {connectionState === "live" ? "LIVE" : 
           connectionState === "connecting" ? "Connecting…" :
           connectionState === "reconnecting" ? "Switching Camera…" : "Connection Error"}
        </span>
        
        {/* Camera Selector Dropdown (Desktop) */}
        {cameras.length > 1 && (
          <div className="relative">
            <button 
              onClick={() => setShowCameraMenu(!showCameraMenu)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span className="max-w-[150px] truncate">
                {cameras.find(c => c.deviceId === selectedCameraId)?.label || "Select Camera"}
              </span>
              {showCameraMenu ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showCameraMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="p-2 text-xs text-slate-400 font-semibold uppercase tracking-wider">Available Cameras</div>
                {cameras.map((cam) => (
                  <button
                    key={cam.deviceId}
                    onClick={() => switchCamera(cam.deviceId)}
                    className={`w-full text-left px-4 py-3 text-sm flex items-center gap-3 hover:bg-slate-700 transition-colors ${
                      selectedCameraId === cam.deviceId ? "bg-blue-600/20 text-blue-400" : "text-slate-200"
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span className="truncate">{cam.label || `Camera ${cam.deviceId.slice(0, 4)}`}</span>
                    {selectedCameraId === cam.deviceId && <span className="ml-auto text-blue-400 text-xs">Active</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-black">
        <div ref={videoRef} className="w-full h-full object-cover" />
        
        {connectionState === "error" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <p className="text-red-300 text-sm max-w-sm text-center px-4">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Announcement Popup */}
      {showAnnounce && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white rounded-xl p-4 w-full max-w-sm mx-4 shadow-2xl border border-slate-200">
          <textarea
            value={announceText} onChange={(e) => setAnnounceText(e.target.value)} rows={2}
            placeholder="Type announcement for students..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <div className="flex gap-2">
            <button onClick={handleAnnounce} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Send</button>
            <button onClick={() => setShowAnnounce(false)} className="flex-1 text-slate-600 hover:bg-slate-100 text-sm font-medium px-4 py-2 rounded-lg transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {/* Bottom Controls Bar */}
      <div className="flex items-center justify-center gap-3 sm:gap-6 py-6 bg-slate-900/80 backdrop-blur-sm px-4">
        {/* Mic Toggle */}
        <button onClick={toggleMic} className={`p-4 rounded-full transition-all ${isMuted ? "bg-red-600 hover:bg-red-700" : "bg-slate-800 hover:bg-slate-700"} text-white`}>
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Camera On/Off Toggle */}
        <button onClick={toggleCamera} className={`p-4 rounded-full transition-all ${isCameraOff ? "bg-red-600 hover:bg-red-700" : "bg-slate-800 hover:bg-slate-700"} text-white`}>
          {isCameraOff ? <VideoOff className="w-6 h-6" /> : <VideoIcon className="w-6 h-6" />}
        </button>

        {/* 🌟 Quick Flip Button (Only shows if multiple cameras exist) */}
        {cameras.length > 1 && (
          <button onClick={quickFlipCamera} className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-full transition-all" title="Flip Camera">
            <RefreshCw className="w-6 h-6" />
          </button>
        )}

        {/* Announcement */}
        <button onClick={() => setShowAnnounce(true)} className="bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-full transition-all">
          <Megaphone className="w-6 h-6" />
        </button>

        {/* End Class */}
        <button onClick={handleEndClass} className="bg-red-600 hover:bg-red-700 text-white p-4 rounded-full transition-all shadow-lg shadow-red-900/50">
          <PhoneOff className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
