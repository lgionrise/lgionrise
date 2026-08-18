// src/lib/django-api.ts — poori file replace karo
import { getAccessToken, getRefreshToken, setSessionCookies, clearSessionCookies } from "./session";

const API_BASE_URL = process.env.DJANGO_API_URL || "https://api.lgion.qalbconverfy.in/api/v1";

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// Shared in-flight refresh promise — dedupes concurrent refresh attempts so
// only ONE refresh call ever happens at a time, regardless of how many
// parallel API calls need it. This is the fix for the random-logout bug.
let refreshInFlight: Promise<string | null> | null = null;

function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString());
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

async function getValidAccessToken(): Promise<string | undefined> {
  const token = await getAccessToken();
  if (!token) return undefined;

  const expiryMs = decodeJwtExpiry(token);
  const isExpiringSoon = expiryMs !== null && expiryMs - Date.now() < 30_000; // refresh 30s before expiry, proactively

  if (isExpiringSoon) {
    const refreshed = await tryRefreshToken();
    return refreshed || token;
  }
  return token;
}

export async function djangoFetch(path: string, options: FetchOptions = {}) {
  const { skipAuth, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  if (!(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (!skipAuth) {
    const token = await getValidAccessToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  let response = await fetch(`${API_BASE_URL}${path}`, { ...fetchOptions, headers, cache: "no-store" });

  if (response.status === 401 && !skipAuth) {
    const refreshed = await tryRefreshToken();
    if (refreshed) {
      headers.set("Authorization", `Bearer ${refreshed}`);
      response = await fetch(`${API_BASE_URL}${path}`, { ...fetchOptions, headers, cache: "no-store" });
    }
  }

  return response;
}

async function tryRefreshToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight; // another call already refreshing — wait for it, don't start a second one

  refreshInFlight = (async () => {
    const refreshToken = await getRefreshToken();
    if (!refreshToken) return null;

    const res = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!res.ok) {
      await clearSessionCookies();
      return null;
    }

    const data = await res.json();
    const newRefreshToken = data.refresh || refreshToken;
    await setSessionCookies(data.access, newRefreshToken);
    return data.access;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

export async function getApiErrorMessage(response: Response): Promise<string> {
  try {
    const data = await response.json();
    return data?.error?.message || "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}
