// src/app/api/teacher/live-classes/[publicId]/announcements/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function POST(request: NextRequest, { params }: { params: Promise < { publicId: string } > }) {
  const { publicId } = await params;
  const body = await request.json();
  const res = await djangoFetch(`/live-classes/${publicId}/announcements/`, { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json({ success: true });
}