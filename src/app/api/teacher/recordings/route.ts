// src/app/api/teacher/recordings/route.ts
import { NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function GET() {
  const res = await djangoFetch("/recordings/mine/");
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}
