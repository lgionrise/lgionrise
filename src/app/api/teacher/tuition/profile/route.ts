// src/app/api/teacher/tuition/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function GET() {
  const res = await djangoFetch("/private-tuition/my-profile/");
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const res = await djangoFetch("/private-tuition/my-profile/", { method: "PATCH", body: JSON.stringify(body) });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}