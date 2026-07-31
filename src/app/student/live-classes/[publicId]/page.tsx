// src/app/student/live-classes/[publicId]/page.tsx
"use client";

import { useEffect, useRef, useState, use } from "react";
import { useRouter } from "next/navigation";
import AgoraRTC, { IAgoraRTCClient, IRemoteVideoTrack } from "agora-rtc-sdk-ng";
import { Send, LogOut, MessageCircle, X } from "lucide-react";

type ChatMessage = {
  public_id: string;
  sender_name: string;
  message: string;
  created_at: string;
};

export default function StudentLiveClassPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = use(params);
  const router = useRouter();
  const videoContainerRef = useRef<HTMLDivElement>(null);
  
  const [status, setStatus] = useState("Connecting to class...");
  const [error, setError] = useState("");
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showChat, setShowChat] = useState(true);

  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const remoteVideoTrackRef = useRef<IRemoteVideoTrack | null>(null);

  // 1. Join Agora as Audience & Fetch Chat
  useEffect(() => {
    let mounted = true;
    
    async function joinClass() {
      try {
        const token = localStorage.getItem("lgion_access_token");
        if (!token) {
          router.push("/student-login");
          return;
        }

        // Fetch Agora Join Token from Backend
        const joinRes = await fetch(`/api/teacher/live-classes/${publicId}/join`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` }
        });
        
        // Note: If your API route for students is different, change the URL above.
        // Assuming the same /api/teacher/... proxy works or use direct API URL:
        // const joinRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/live-classes/${publicId}/join/`, ...
        
        if (!joinRes.ok) throw new Error("Could not join class. Invalid ID or not started.");
        const { channel_name, token: agoraToken, app_id, uid } = await joinRes.json();

        // Initialize Agora Client as AUDIENCE
        const client = AgoraRTC.createClient({ mode: "live", codec: "vp8" });
        clientRef.current = client;
        await client.setClientRole("audience"); // CRITICAL: Student is audience

        client.on("user-published", async (user, mediaType) => {
          await client.subscribe(user, mediaType);
          if (mediaType === "video" && user.videoTrack && videoContainerRef.current) {
            remoteVideoTrackRef.current = user.videoTrack;
            user.videoTrack.play(videoContainerRef.current);
          }
          if (mediaType === "audio") {
            user.audioTrack?.play();
          }
        });

        client.on("user-unpublished", (user) => {
          if (remoteVideoTrackRef.current) {
            remoteVideoTrackRef.current.stop();
            remoteVideoTrackRef.current = null;
          }
          if (videoContainerRef.current) {
            videoContainerRef.current.innerHTML = "";
          }
        });

        await client.join(app_id, channel_name, agoraToken, uid);
        if (mounted) setStatus("Live");

        // Fetch initial chat messages
        fetchChatMessages(token);

      } catch (err) {
        console.error(err);
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to join class");
          setStatus("error");
        }
      }
    }

    joinClass();

    return () => {
      mounted = false;
      remoteVideoTrackRef.current?.stop();
      clientRef.current?.leave();
    };
  }, [publicId, router]);

  // Helper to fetch chat
  const fetchChatMessages = async (token: string) => {
    try {
      const res = await fetch(`/api/teacher/live-classes/${publicId}/chat/`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.results || data); // Adjust based on your API response structure
      }
    } catch (err) {
      console.error("Chat fetch error:", err);
    }
  };

  // Send Chat Message
  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem("lgion_access_token");
    try {
      const res = await fetch(`/api/teacher/live-classes/${publicId}/chat/`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({ message: newMessage }),
      });

      if (res.ok) {
        setNewMessage("");
        fetchChatMessages(token); // Refresh chat
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
  };

  const leaveClass = async () => {
    remoteVideoTrackRef.current?.stop();
    await clientRef.current?.leave();
    router.push("/student/join");
  };

  return (
    <div className="fixed inset-0 bg-slate-950 flex flex-col md:flex-row z-50">
      {/* Main Video Area */}
      <div className="flex-1 relative bg-black flex flex-col">
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10 bg-gradient-to-b from-black/70 to-transparent">
          <span className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2 ${
            status === "Live" ? "bg-red-600 text-white animate-pulse" :
            status === "error" ? "bg-red-900 text-red-200" : "bg-slate-700 text-slate-300"
          }`}>
            {status === "Live" && <span className="w-2 h-2 bg-white rounded-full" />}
            {status === "Live" ? "LIVE" : status === "error" ? "Error" : "Connecting..."}
          </span>
          
          <button 
            onClick={leaveClass}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" /> Leave
          </button>
        </div>

        {/* Video Container */}
        <div className="flex-1 flex items-center justify-center">
          <div ref={videoContainerRef} className="w-full h-full max-h-screen" />
          
          {status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-20">
              <p className="text-red-300 text-sm text-center px-4">{error}</p>
            </div>
          )}
          
          {status !== "error" && !remoteVideoTrackRef.current && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <p className="text-slate-400 text-sm">Waiting for teacher to start video...</p>
            </div>
          )}
        </div>

        {/* Mobile Chat Toggle */}
        <button 
          onClick={() => setShowChat(!showChat)}
          className="md:hidden absolute bottom-20 right-4 bg-emerald-600 text-white p-3 rounded-full shadow-lg z-20"
        >
          {showChat ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </button>
      </div>

      {/* Chat Sidebar */}
      <div className={`w-full md:w-80 bg-slate-900 border-l border-slate-800 flex flex-col ${showChat ? 'flex' : 'hidden md:flex'}`}>
        <div className="p-4 border-b border-slate-800">
          <h3 className="text-white font-semibold text-sm">Class Chat</h3>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-slate-500 text-xs text-center mt-10">No messages yet.</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.public_id} className="bg-slate-800 rounded-lg p-3">
                <p className="text-emerald-400 text-xs font-medium mb-1">{msg.sender_name || 'Student'}</p>
                <p className="text-slate-200 text-sm break-words">{msg.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Chat Input */}
        <form onSubmit={sendMessage} className="p-4 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <button 
            type="submit"
            className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
