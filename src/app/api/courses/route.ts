// src/app/api/courses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;
  const res = await djangoFetch(`/courses/${search}`);
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}