// src/app/api/teacher/notifications/mark-all-read/route.ts
import { NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function POST() {
  const res = await djangoFetch("/notifications/mark-all-read/", { method: "POST" });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json({ success: true });
}
