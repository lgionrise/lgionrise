// src/app/api/auth/me/route.ts — poori file replace karo
import { NextResponse } from "next/server";
import { djangoFetch } from "@/lib/django-api";
import { getAccessToken } from "@/lib/session";

export async function GET() {
  const token = await getAccessToken();
  if (!token) {
    // FIX: was returning 200 with {user: null} — callers couldn't tell
    // "not logged in" apart from "server error". Now returns a real 401.
    return NextResponse.json({ user: null, reason: "no_session" }, { status: 401 });
  }

  const res = await djangoFetch("/auth/profile/");
  if (!res.ok) {
    const errorText = await res.text();
    return NextResponse.json({ user: null, reason: "backend_error", detail: errorText }, { status: res.status });
  }

  const user = await res.json();
  return NextResponse.json({ user });
}
