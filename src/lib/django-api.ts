// src/lib/django-api.ts
import { getAccessToken, getRefreshToken, setSessionCookies, clearSessionCookies } from "./session";

const API_BASE_URL = process.env.DJANGO_API_URL || "https://api.lgion.qalbconverfy.in/api/v1";

interface FetchOptions extends RequestInit {
  skipAuth ? : boolean;
}

export async function djangoFetch(path: string, options: FetchOptions = {}) {
  const { skipAuth, ...fetchOptions } = options;
  const headers = new Headers(fetchOptions.headers);
  if (!(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  
  if (!skipAuth) {
    const token = await getAccessToken();
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

async function tryRefreshToken(): Promise < string | null > {
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
  await setSessionCookies(data.access, refreshToken);
  return data.access;
}

export async function getApiErrorMessage(response: Response): Promise < string > {
  try {
    const data = await response.json();
    return data?.error?.message || "Something went wrong.";
  } catch {
    return "Something went wrong.";
  }
}