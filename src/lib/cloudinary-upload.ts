// src/lib/cloudinary-upload.ts
"use client";

interface UploadResult {
  secure_url: string;
}

export async function uploadToCloudinary(
  file: File,
  folder: "profile-photos" | "batch-thumbnails" | "course-thumbnails" | "doubt-attachments"
): Promise<string> {
  const sigRes = await fetch(`/api/media/cloudinary-signature?folder=${folder}`);
  if (!sigRes.ok) throw new Error("Could not authorize upload.");
  const sig = await sigRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.api_key);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    throw new Error(err.error?.message || "Upload to Cloudinary failed.");
  }

  const data: UploadResult = await uploadRes.json();
  return data.secure_url;
}
