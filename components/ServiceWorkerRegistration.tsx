"use client";

import { useEffect } from "react";

import { IS_PRODUCTION } from "@/lib/config";

// En desarrollo no lo registro: guardaría estáticos que el servidor de desarrollo recompila a cada rato
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!IS_PRODUCTION || !("serviceWorker" in navigator)) return;
    // Lo registro en una task aparte, después de la carga, para no competir con la hidratación
    const register = () => setTimeout(() => void navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" }), 0);
    if (document.readyState === "complete") register();
    else addEventListener("load", register, { once: true });
  }, []);
  return null;
}
