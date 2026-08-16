// src/lib/cloudinary-upload.ts
"use client";

interface UploadResult {
  secure_url: string;
}

export async function uploadToCloudinary(
  file: File,
  folder:
    | "profile-photos"
    | "batch-thumbnails"
    | "course-thumbnails"
    | "doubt-attachments"
): Promise<string> {
  const sigRes = await fetch(
    `/api/media/cloudinary-signature?folder=${encodeURIComponent(folder)}`
  );

  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({}));
    throw new Error(err.error || "Could not authorize upload.");
  }

  const sig = await sigRes.json();

  if (!sig.signature || !sig.api_key || !sig.cloud_name || !sig.folder) {
    throw new Error("Invalid Cloudinary signature response.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", sig.api_key);
  formData.append("timestamp", String(sig.timestamp));
  formData.append("signature", sig.signature);
  formData.append("folder", sig.folder); // must be exact, e.g. lgion/profile-photos

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.json().catch(() => ({}));
    throw new Error(err.error?.message || "Upload to Cloudinary failed.");
  }

  const data: UploadResult = await uploadRes.json();
  if (!data.secure_url) throw new Error("Cloudinary did not return secure_url.");
  return data.secure_url;
}
