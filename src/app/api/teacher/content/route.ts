// src/app/api/teacher/content/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";
import { getAccessToken } from "@/lib/session";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  const res = await djangoFetch(`/content/${search}`);
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function POST(request: NextRequest) {
  // Multipart passthrough — read the incoming FormData and forward it as-is
  // to Django, attaching only the Authorization header ourselves (never
  // set Content-Type manually for FormData; fetch sets the correct
  // multipart boundary automatically).
  const formData = await request.formData();
  const token = await getAccessToken();

  const API_BASE_URL = process.env.DJANGO_API_URL || "https://api.lgion.qalbconverfy.in/api/v1";
  const res = await fetch(`${API_BASE_URL}/content/upload/`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}