// src/app/api/teacher/batches/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  const res = await djangoFetch(`/batches/mine/${search}`);
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await djangoFetch("/batches/create/", { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}