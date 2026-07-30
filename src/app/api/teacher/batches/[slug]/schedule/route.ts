// src/app/api/teacher/batches/[slug]/schedule/route.ts
import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function GET(request: NextRequest, { params }: { params: Promise < { slug: string } > }) {
  const { slug } = await params;
  const res = await djangoFetch(`/batches/${slug}/schedule/`);
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}

export async function POST(request: NextRequest, { params }: { params: Promise < { slug: string } > }) {
  const { slug } = await params;
  const body = await request.json();
  const res = await djangoFetch(`/batches/${slug}/schedule/`, { method: "POST", body: JSON.stringify(body) });
  if (!res.ok) return NextResponse.json({ error: await getApiErrorMessage(res) }, { status: res.status });
  return NextResponse.json(await res.json());
}