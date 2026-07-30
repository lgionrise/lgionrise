// src/app/api/teacher/live-classes/[publicId]/attendance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function GET(request: NextRequest, { params }: { params: Promise < { publicId: string } > }) {
  const { publicId } = await params;
  const res = await djangoFetch(`/live-classes/${publicId}/attendance/`);
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}