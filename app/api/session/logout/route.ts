import { NextResponse, type NextRequest } from "next/server";

import { apiRequest } from "@/lib/api";
import { API_PATHS } from "@/lib/api-paths";
import { isSameOrigin } from "@/lib/origin";
import { ROUTES } from "@/lib/routes";
import { clearSession, readRefreshToken } from "@/lib/session";

/**
 * Cierre de sesión con un POST nativo (no una Server Action): el 303 provoca una navegación
 * completa, que descarta la caché atrás/adelante del router de Next. Así "atrás" después de
 * cerrar sesión pide la página de nuevo al servidor y no muestra datos de la sesión cerrada.
 */
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return new NextResponse(null, { status: 403 });

  const refreshToken = await readRefreshToken();
  if (refreshToken) {
    // Revoca el refresh token en el backend; si falla, la sesión local se cierra igual
    await apiRequest(API_PATHS.logout, { method: "POST", body: { refresh_token: refreshToken } }).catch(() => undefined);
  }
  await clearSession();
  return NextResponse.redirect(new URL(ROUTES.login, request.url), 303);
}
