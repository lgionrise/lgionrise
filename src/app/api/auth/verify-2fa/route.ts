import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";
import { setSessionCookies } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const res = await djangoFetch("/auth/verify-2fa/", {
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

  if (data.access && data.refresh) {
    await setSessionCookies(data.access, data.refresh);
  }

  return NextResponse.json(data);
}
