// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from "next/server";
import { setSessionCookies } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const res = await fetch(`${process.env.DJANGO_API_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      device_id: "web-" + Date.now(),
      device_type: "web",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    return NextResponse.json(
      { error: data?.error?.message || "Invalid credentials" },
      { status: res.status }
    );
  }

  // Save tokens in HTTP-only cookies
  await setSessionCookies(data.access, data.refresh);

  return NextResponse.json({ success: true, user: data.user });
}