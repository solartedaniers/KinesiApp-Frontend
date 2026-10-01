import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { apiRequest } from "./api";
import { API_PATHS } from "./api-paths";
import { SESSION_COOKIE } from "./config";
import { ApiError } from "./errors";
import { SESSION_COOKIE_NAMES, sessionCookies } from "./session-cookies";
import type { TokenPair, User } from "./types";

/** Sólo en Server Actions o Route Handlers: un Server Component no puede escribir cookies. */
export async function storeSession(tokens: TokenPair): Promise<void> {
  const jar = await cookies();
  for (const cookie of sessionCookies(tokens)) jar.set(cookie.name, cookie.value, cookie.options);
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  for (const name of SESSION_COOKIE_NAMES) jar.delete(name);
}

export async function readAccessToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE.access)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE.refresh)?.value ?? null;
}

/**
 * Usuario de la sesión, o null si no hay sesión o el backend la rechaza (401). Cualquier otra
 * falla (backend caído) se propaga al error boundary: una caída no debe cerrar la sesión.
 * `cache` deduplica por request: layout y página la piden y sale un solo GET /auth/me (§4.3).
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const accessToken = await readAccessToken();
  if (!accessToken) return null;
  try {
    return await apiRequest<User>(API_PATHS.me, { accessToken });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
});
