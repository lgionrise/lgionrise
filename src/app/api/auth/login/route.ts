// src/app/api/auth/login/route.ts — poori file replace karo
import { NextRequest, NextResponse } from "next/server";
import { setSessionCookies } from "@/lib/session";

const API_BASE_URL = process.env.DJANGO_API_URL || "https://api.lgion.qalbconverfy.in/api/v1";

export async function POST(request: NextRequest) {
  const body = await request.json();

  const djangoRes = await fetch(`${API_BASE_URL}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email, password: body.password,
      device_id: body.device_id || "web", device_type: "web",
    }),
  });

  const data = await djangoRes.json();

  if (!djangoRes.ok) {
    return NextResponse.json({ error: data?.error?.message || "Login failed." }, { status: djangoRes.status });
  }

  // A successful login ALWAYS includes an access token — if it's missing,
  // that only happens when 2FA is pending, regardless of what exact flag
  // name/shape the backend used for requires_2fa. This is what fixes the
  // "account type couldn't be determined" bug.
  if (!data.access) {
    return NextResponse.json({ requires_2fa: true });
  }

  await setSessionCookies(data.access, data.refresh);
  return NextResponse.json({ user: data.user });
}
