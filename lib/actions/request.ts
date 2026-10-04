import "server-only";

import { redirect } from "next/navigation";

import { apiRequest, type RequestOptions } from "../api";
import { ApiError } from "../errors";
import { ROUTES } from "../routes";
import { readAccessToken } from "../session";

/**
 * Mutación autenticada desde una Server Action: agrega el Bearer de la cookie. Un 401 significa que
 * la sesión ya no vale y se cierra; cualquier otro error lo traduce el formulario por su `code`.
 */
export async function authedMutation<T = void>(path: string, options: Omit<RequestOptions, "accessToken">): Promise<T> {
  try {
    return await apiRequest<T>(path, { ...options, accessToken: (await readAccessToken()) ?? undefined });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(ROUTES.sessionExpired);
    throw error;
  }
}
