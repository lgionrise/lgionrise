// src/app/api/student/tests/attempts/[attemptId]/answer/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function POST(request: NextRequest, { params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params;
  const body = await request.json();
  const res = await djangoFetch(`/tests/attempts/${attemptId}/answer/`, { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json({ success: true });
}
