// src/app/api/teacher/tuition/bookings/[publicId]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function POST(request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const res = await djangoFetch(`/private-tuition/bookings/${publicId}/complete/`, { method: "POST" });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json({ success: true });
}