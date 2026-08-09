// src/components/ui/avatar-upload.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";
import { getInitials } from "@/lib/utils";

interface AvatarUploadProps {
  currentUrl?: string | null;
  firstName: string;
  lastName: string;
  onUploaded: (url: string) => void;
}

export function AvatarUpload({ currentUrl, firstName, lastName, onUploaded }: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5MB.");
      return;
    }

    setError(""); setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file, "profile-photos");
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-indigo-100 overflow-hidden relative border-4 border-white shadow-md">
          {currentUrl ? (
            <Image src={currentUrl} alt="Profile" fill className="object-cover" />
          ) : (
            <span className="w-full h-full flex items-center justify-center text-2xl font-bold text-indigo-600">
              {getInitials(firstName, lastName)}
            </span>
          )}
          {isUploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-white animate-spin" />
            </div>
          )}
        </div>
        <button
          onClick={() => inputRef.current?.click()}
          className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full shadow-md border-2 border-white"
        >
          <Camera className="w-3.5 h-3.5" />
        </button>
        <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </div>
      {error && <p className="text-xs text-red-600 mt-2 text-center">{error}</p>}
    </div>
  );
}
