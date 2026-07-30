// src/lib/session.ts
import { cookies } from "next/headers";

const ACCESS_COOKIE = "lgion_access";
const REFRESH_COOKIE = "lgion_refresh";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

export async function setSessionCookies(access: string, refresh: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_COOKIE, access, { ...COOKIE_OPTIONS, maxAge: 60 * 15 });
  cookieStore.set(REFRESH_COOKIE, refresh, { ...COOKIE_OPTIONS, maxAge: 60 * 60 * 24 * 7 });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_COOKIE)?.value;
}

export async function clearSessionCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}