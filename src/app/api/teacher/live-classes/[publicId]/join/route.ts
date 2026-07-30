// src/app/api/teacher/live-classes/[publicId]/join/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function POST(request: NextRequest, { params }: { params: Promise < { publicId: string } > }) {
  const { publicId } = await params;
  const res = await djangoFetch(`/live-classes/${publicId}/join/`, { method: "POST" });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}