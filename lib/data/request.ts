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

/**
 * POST idempotente desde un Server Component (p. ej. abrir el chat al mostrar un análisis). Como
 * authedGet, cierra la sesión con 401 y esconde 403/404; cualquier otro error se propaga a quien llama.
 */
export async function authedPost<T>(path: string): Promise<T> {
  try {
    return await apiRequest<T>(path, { method: "POST", accessToken: (await readAccessToken()) ?? undefined });
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

/** Lista paginada con skip/limit: pide páginas hasta recibir una incompleta, para no cortar en silencio. */
export async function authedGetAllPages<T>(path: string, pageSize: number): Promise<T[]> {
  const items: T[] = [];
  for (let skip = 0; ; skip += pageSize) {
    const page = await authedGet<T[]>(`${path}?${new URLSearchParams({ skip: String(skip), limit: String(pageSize) })}`);
    items.push(...page);
    if (page.length < pageSize) return items;
  }
}
