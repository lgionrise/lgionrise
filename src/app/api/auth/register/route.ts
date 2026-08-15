// src/app/api/auth/register/route.ts — poori file replace karo
import { NextRequest, NextResponse } from "next/server";
import { setSessionCookies } from "@/lib/session";

const API_BASE_URL = process.env.DJANGO_API_URL || "https://api.lgion.qalbconverfy.in/api/v1";

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  let registerRes: Response;
  try {
    registerRes = await fetch(`${API_BASE_URL}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (err) {
    console.error("Register: network error reaching backend:", err);
    return NextResponse.json({ error: "Could not reach the server. Please try again." }, { status: 502 });
  }

  let registerData;
  try {
    registerData = await registerRes.json();
  } catch {
    console.error("Register: backend returned non-JSON response, status:", registerRes.status);
    return NextResponse.json({ error: "Unexpected server response." }, { status: 502 });
  }

  if (!registerRes.ok) {
    const message = registerData?.error?.message
      || (typeof registerData === "object" ? Object.values(registerData).flat().join(" ") : null)
      || "Registration failed.";
    return NextResponse.json({ error: message }, { status: registerRes.status });
  }

  // Registration succeeded — try auto-login, but don't fail the whole
  // request if auto-login itself has an issue (e.g. email verification
  // required later). The account IS created either way.
  try {
    const loginRes = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: body.email, password: body.password, device_id: "web", device_type: "web" }),
    });
    const loginData = await loginRes.json();

    if (loginRes.ok && !loginData.requires_2fa) {
      await setSessionCookies(loginData.access, loginData.refresh);
      return NextResponse.json({ user: loginData.user });
    }
  } catch (err) {
    console.error("Register: auto-login attempt failed:", err);
  }

  // Account created but auto-login didn't complete — tell the user
  // explicitly rather than silently failing.
  return NextResponse.json({ user: registerData.user, requiresVerification: true });
}
