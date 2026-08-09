// src/app/api/teacher/recordings/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAccessToken } from "@/lib/session";
import { getApiErrorMessage } from "@/lib/django-api";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const token = await getAccessToken();

  const API_BASE_URL = process.env.DJANGO_API_URL || "https://api.lgion.qalbconverfy.in/api/v1";
  const res = await fetch(`${API_BASE_URL}/recordings/upload/youtube/`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}
