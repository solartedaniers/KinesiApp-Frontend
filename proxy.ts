import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_REFRESH_LEEWAY_SECONDS, SESSION_COOKIE } from "@/lib/config";
import { secondsUntilExpiry, shouldRefresh } from "@/lib/jwt";
import { isAuthRoute, isPrivateRoute, NEXT_PARAM, ROUTES } from "@/lib/routes";
import { SESSION_COOKIE_NAMES, sessionCookies } from "@/lib/session-cookies";
import { refreshSession } from "@/lib/session-refresh";
import type { TokenPair } from "@/lib/types";

/**
 * Corre antes de renderizar (§4.4 y §9.2 del diseño):
 * 1. Renueva el access token si falta o vence en menos de ACCESS_REFRESH_LEEWAY_SECONDS.
 * 2. Sólo decide anónimo vs. autenticado; el rol lo valida el layout de cada rol.
 */
export async function proxy(request: NextRequest) {
  const access = request.cookies.get(SESSION_COOKIE.access)?.value;
  const refresh = request.cookies.get(SESSION_COOKIE.refresh)?.value;

  let refreshed: TokenPair | null = null;
  let revoked = false;
  if (refresh && shouldRefresh(access, ACCESS_REFRESH_LEEWAY_SECONDS)) {
    const result = await refreshSession(refresh);
    if (result.status === "refreshed") refreshed = result.tokens;
    revoked = result.status === "revoked";
  }

  const hasSession = refreshed !== null || (!revoked && access !== undefined && secondsUntilExpiry(access) > 0);
  const { pathname, search } = request.nextUrl;

  if (!hasSession && isPrivateRoute(pathname)) {
    const login = new URL(ROUTES.login, request.url);
    login.searchParams.set(NEXT_PARAM, `${pathname}${search}`);
    return applySession(NextResponse.redirect(login), refreshed, revoked);
  }
  if (hasSession && isAuthRoute(pathname)) {
    return applySession(NextResponse.redirect(new URL(ROUTES.home, request.url)), refreshed, revoked);
  }

  // El Server Component de este mismo request debe leer ya el token nuevo, no el vencido
  if (refreshed) {
    for (const cookie of sessionCookies(refreshed)) request.cookies.set(cookie.name, cookie.value);
  }
  if (revoked) {
    for (const name of SESSION_COOKIE_NAMES) request.cookies.delete(name);
  }
  return applySession(NextResponse.next({ request: { headers: request.headers } }), refreshed, revoked);
}

/** Lleva al navegador las cookies renovadas, o las borra si el backend revocó la sesión. */
function applySession(response: NextResponse, refreshed: TokenPair | null, revoked: boolean): NextResponse {
  if (refreshed) {
    for (const cookie of sessionCookies(refreshed)) response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  if (revoked) {
    for (const name of SESSION_COOKIE_NAMES) response.cookies.delete(name);
  }
  return response;
}

export const config = {
  matcher: [
    {
      // Todo salvo archivos estáticos (incluido el Web Worker de public/workers). Los prefetch del
      // router se excluyen: nunca renuevan tokens, porque varios en paralelo gastarían el mismo
      // refresh token rotado (§4.4)
      source: "/((?!_next/static|_next/image|favicon.ico|workers/).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
