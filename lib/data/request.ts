import "server-only";

import { notFound, redirect } from "next/navigation";

import { Code, rpcCode } from "../grpc/errors";
import { ROUTES } from "../routes";

/**
 * Lectura autenticada para Server Components:
 * - UNAUTHENTICATED → la sesión ya no vale: se cierra (Route Handler que borra las cookies).
 * - PERMISSION_DENIED/NOT_FOUND → "no encontrado": no se revela si el recurso existe para otro usuario.
 * - Otro error → error boundary (app/(app)/error.tsx), sin cerrar la sesión.
 */
export async function authedRead<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    const code = rpcCode(error);
    if (code === Code.Unauthenticated) redirect(ROUTES.sessionExpired);
    if (code === Code.PermissionDenied || code === Code.NotFound) notFound();
    throw error;
  }
}

/** Igual que authedRead, pero NOT_FOUND es un resultado válido (p. ej. "todavía no tiene ficha"). */
export async function authedReadOrNull<T>(call: () => Promise<T>): Promise<T | null> {
  try {
    return await call();
  } catch (error) {
    if (rpcCode(error) === Code.NotFound) return null;
    return authedRead(() => Promise.reject(error));
  }
}
