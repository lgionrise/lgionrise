// src/app/api/auth/login/verify-2fa/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setSessionCookies } from "@/lib/session";

const API_BASE_URL = process.env.DJANGO_API_URL || "https://api.lgion.qalbconverfy.in/api/v1";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await fetch(`${API_BASE_URL}/auth/login/verify-2fa/`, {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) return NextResponse.json({ error: data?.error?.message || "Invalid code." }, { status: res.status });

  await setSessionCookies(data.access, data.refresh);
  return NextResponse.json({ user: data.user });
}
