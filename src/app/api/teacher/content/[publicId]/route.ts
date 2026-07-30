// src/app/api/teacher/content/[publicId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const body = await request.json();
  const res = await djangoFetch(`/content/${publicId}/manage/`, { method: "PATCH", body: JSON.stringify(body) });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const res = await djangoFetch(`/content/${publicId}/manage/`, { method: "DELETE" });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json({ success: true });
}