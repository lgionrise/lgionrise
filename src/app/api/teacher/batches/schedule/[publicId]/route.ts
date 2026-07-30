// src/app/api/teacher/batches/schedule/[publicId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;
  const res = await djangoFetch(`/batches/schedule/${publicId}/`, { method: "DELETE" });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json({ success: true });
}