import { NextRequest, NextResponse } from "next/server";
import { djangoFetch, getApiErrorMessage } from "@/lib/django-api";

export async function GET(request: NextRequest) {
  const folder = request.nextUrl.searchParams.get("folder") || "profile-photos";
  const res = await djangoFetch(
    `/media/cloudinary-signature/?folder=${encodeURIComponent(folder)}`
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: await getApiErrorMessage(res) },
      { status: res.status }
    );
  }

  return NextResponse.json(await res.json());
}
