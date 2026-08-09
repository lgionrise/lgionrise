// src/components/ui/thumbnail-upload.tsx
"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Camera, Loader2, ImagePlus } from "lucide-react";
import { uploadToCloudinary } from "@/lib/cloudinary-upload";

export function ThumbnailUpload({
  currentUrl, onUploaded,
}: { currentUrl?: string; onUploaded: (url: string) => void }) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setError("Please choose an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { setError("Image must be under 5MB."); return; }

    setError(""); setIsUploading(true);
    try {
      const url = await uploadToCloudinary(file, "batch-thumbnails");
      onUploaded(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <button
        type="button" onClick={() => inputRef.current?.click()}
        className="relative w-full aspect-video rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 overflow-hidden flex items-center justify-center"
      >
        {currentUrl ? (
          <Image src={currentUrl} alt="Thumbnail" fill className="object-cover" />
        ) : (
          <div className="text-slate-400 flex flex-col items-center gap-1.5">
            <ImagePlus className="w-6 h-6" />
            <span className="text-xs font-medium">Upload thumbnail</span>
          </div>
        )}
        {isUploading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-md">
          <Camera className="w-3.5 h-3.5 text-slate-600" />
        </div>
      </button>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}
