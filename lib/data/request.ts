import "server-only";

import { notFound, redirect } from "next/navigation";

import { apiRequest } from "../api";
import { ApiError } from "../errors";
import { ROUTES } from "../routes";
import { readAccessToken } from "../session";

/**
 * Lectura autenticada para Server Components:
 * - 401 → la sesión ya no vale: se cierra (Route Handler que borra las cookies).
 * - 403/404 → "no encontrado": no se revela si el recurso existe para otro usuario.
 * - Otro error → error boundary (app/(app)/error.tsx), sin cerrar la sesión.
 */
export async function authedGet<T>(path: string): Promise<T> {
  try {
    return await apiRequest<T>(path, { accessToken: (await readAccessToken()) ?? undefined });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(ROUTES.sessionExpired);
    if (error instanceof ApiError && (error.status === 403 || error.status === 404)) notFound();
    throw error;
  }
}

/** Igual que authedGet, pero un 404 es un resultado válido (p. ej. "todavía no tiene ficha"). */
export async function authedGetOrNull<T>(path: string): Promise<T | null> {
  try {
    return await apiRequest<T>(path, { accessToken: (await readAccessToken()) ?? undefined });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    if (error instanceof ApiError && error.status === 401) redirect(ROUTES.sessionExpired);
    if (error instanceof ApiError && error.status === 403) notFound();
    throw error;
  }
}
