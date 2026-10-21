import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { AI_WAKE_COOKIE, IS_PRODUCTION, SESSION_COOKIE } from "./config";
import { accountGateway } from "./grpc/account-gateway";
import { Code, rpcCode } from "./grpc/errors";
import { AI_WAKE_COOKIE_MAX_AGE_SECONDS } from "./server-config";
import { SESSION_COOKIE_NAMES, sessionCookies } from "./session-cookies";
import type { TokenPair, User } from "./types";

/** Sólo en Server Actions o Route Handlers: un Server Component no puede escribir cookies. */
export async function storeSession(tokens: TokenPair): Promise<void> {
  const jar = await cookies();
  for (const cookie of sessionCookies(tokens)) jar.set(cookie.name, cookie.value, cookie.options);
}

/**
 * Al abrir sesión dejo una cookie de un solo uso: la app la consume al entrar y despierta la IA. No es
 * httpOnly porque la lee el navegador, y no lleva nada sensible.
 */
export async function requestAiWakeOnEntry(): Promise<void> {
  (await cookies()).set(AI_WAKE_COOKIE, "1", { path: "/", sameSite: "lax", secure: IS_PRODUCTION, maxAge: AI_WAKE_COOKIE_MAX_AGE_SECONDS });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  for (const name of SESSION_COOKIE_NAMES) jar.delete(name);
}

async function readAccessToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE.access)?.value ?? null;
}

export async function readRefreshToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE.refresh)?.value ?? null;
}

/**
 * Usuario de la sesión, o null si no hay sesión o el backend la rechaza (UNAUTHENTICATED). Cualquier
 * otra falla (backend caído) se propaga al error boundary: una caída no debe cerrar la sesión.
 * `cache` deduplica por request: layout y página la piden y sale un solo GetMyAccount.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  if (!(await readAccessToken())) return null;
  try {
    return await accountGateway().me();
  } catch (error) {
    if (rpcCode(error) === Code.Unauthenticated) return null;
    throw error;
  }
});
