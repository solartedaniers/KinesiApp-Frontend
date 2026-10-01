import { t } from "./i18n";
import type { ValidationError } from "./validation";

export const NETWORK_ERROR_CODE = "network";
export const VALIDATION_ERROR_CODE = "validation_error";

/** Error de la API con el `code` estable del backend; el cliente traduce por code, no por detail. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

export function errorMessage(error: unknown): string {
  const code = error instanceof ApiError ? error.code : "generic";
  return code in t.errors ? t.errors[code as keyof typeof t.errors] : t.errors.generic;
}

export function validationMessages<K extends string>(
  errors: Partial<Record<K, ValidationError>>,
): Partial<Record<K, string>> {
  return Object.fromEntries(
    Object.entries(errors).map(([field, error]) => [field, t.validation[error as ValidationError]]),
  ) as Partial<Record<K, string>>;
}
