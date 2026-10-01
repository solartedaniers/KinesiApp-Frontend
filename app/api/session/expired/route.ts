import { NextResponse, type NextRequest } from "next/server";

import { ROUTES } from "@/lib/routes";
import { clearSession } from "@/lib/session";

/**
 * Destino de lib/guard.ts cuando el backend rechaza la sesión (cuenta desactivada, token
 * revocado). Un Server Component no puede borrar cookies; un Route Handler sí. Sólo borra
 * cookies propias, así que un GET forzado desde otro sitio no puede hacer más que eso.
 */
export async function GET(request: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL(ROUTES.login, request.url), 303);
}
