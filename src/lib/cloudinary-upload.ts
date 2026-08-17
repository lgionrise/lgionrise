// src/lib/cloudinary-upload.ts — poori file replace karo
"use client";

type CloudinaryFolder =
  | "profile-photos"
  | "batch-thumbnails"
  | "course-thumbnails"
  | "doubt-attachments"
  | "study-material";

interface UploadResult {
  secure_url: string;
  bytes: number;
}

export async function uploadToCloudinary(file: File, folder: CloudinaryFolder): Promise<string> {
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

export async function uploadFileToCloudinary(
  file: File,
  folder: CloudinaryFolder
): Promise<{ url: string; bytes: number }> {
  const sigRes = await fetch(`/api/media/cloudinary-signature?folder=${folder}`);
  if (!sigRes.ok) throw new Error("Could not authorize upload.");
  const sig = await sigRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.api_key);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder);

  // Raw resource type — PDFs/docs use a different Cloudinary endpoint than images
  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloud_name}/raw/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const err = await uploadRes.json();
    throw new Error(err.error?.message || "File upload failed.");
  }

  const data = await uploadRes.json();
  return { url: data.secure_url, bytes: data.bytes };
}
