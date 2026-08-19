import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function POST(request: NextRequest) {
  const body = await request.json();
  // backend path adjust if different: /auth/resend-otp/ or /auth/2fa/resend/
  const res = await djangoFetch("/auth/resend-2fa/", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json(
      { error: data?.error?.message || data?.error || (await getApiErrorMessage(res)) },
      { status: res.status }
    );
  }
  return NextResponse.json(data);
}
