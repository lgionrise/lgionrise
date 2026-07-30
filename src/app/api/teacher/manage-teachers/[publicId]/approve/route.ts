// src/app/api/teacher/manage-teachers/[publicId]/approve/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function POST(request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const res = await djangoFetch(`/auth/teachers/${publicId}/approve/`, { method: "POST" });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json({ success: true });
}
