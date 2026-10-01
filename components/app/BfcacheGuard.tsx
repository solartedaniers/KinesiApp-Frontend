"use client";

import { useEffect } from "react";

/**
 * Si el navegador restaura esta página desde su bfcache (Safari y Firefox pueden hacerlo aunque
 * la respuesta sea no-store), se recarga: así "atrás" después de cerrar sesión pasa por proxy.ts
 * y termina en /login en vez de mostrar datos de la sesión cerrada.
 */
export function BfcacheGuard() {
  useEffect(() => {
    const reloadIfRestored = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", reloadIfRestored);
    return () => window.removeEventListener("pageshow", reloadIfRestored);
  }, []);
  return null;
}
