// src/app/api/teacher/recordings/upload-cloudflare/initiate/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await djangoFetch("/recordings/upload/initiate/", { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}
