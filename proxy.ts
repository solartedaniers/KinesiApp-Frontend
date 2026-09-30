import { NextResponse } from "next/server";

// Next 16 renombró middleware.ts a proxy.ts (misma función).
// Fase 1: refresh anticipado de kin_at y redirección anónimo/autenticado (§4.4, §9.2)
export function proxy() {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/home",
    "/account/:path*",
    "/athlete/:path*",
    "/coach/:path*",
    "/admin/:path*",
    "/analysis/:path*",
  ],
};
