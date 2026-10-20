import "server-only";

import { redirect, unstable_rethrow } from "next/navigation";

import { errorMessage } from "../errors";
import { Code, rpcCode } from "../grpc/errors";
import type { Dictionary } from "../i18n";
import { ROUTES } from "../routes";

/**
 * Mutación autenticada desde una Server Action. UNAUTHENTICATED significa que la sesión ya no vale y
 * se cierra; cualquier otro error lo traduce el formulario con failureMessage.
 */
export async function authedMutation<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (rpcCode(error) === Code.Unauthenticated) redirect(ROUTES.sessionExpired);
    throw error;
  }
}

/** Mensaje traducido para el formulario. Dejo pasar el redirect de authedMutation: si no, el catch se lo tragaría. */
export function failureMessage(t: Dictionary, error: unknown): string {
  unstable_rethrow(error);
  return errorMessage(t, error);
}
