import { type Dictionary, format } from "./i18n";
import { VALIDATION_PARAMS, type ValidationError } from "./validation";

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

// Todas reciben el diccionario activo: en el servidor sale de getT(), en el cliente de useT()

/** Mensaje traducido de un `code` estable del backend (o del cliente); el genérico si no se conoce. */
export function codeMessage(t: Dictionary, code: string): string {
  return code in t.errors ? t.errors[code as keyof typeof t.errors] : t.errors.generic;
}

export function errorMessage(t: Dictionary, error: unknown): string {
  return codeMessage(t, error instanceof ApiError ? error.code : "generic");
}

export function validationMessage(t: Dictionary, error: ValidationError): string {
  return format(t.validation[error], VALIDATION_PARAMS[error] ?? {});
}

export function validationMessages<K extends string>(
  t: Dictionary,
  errors: Partial<Record<K, ValidationError>>,
): Partial<Record<K, string>> {
  return Object.fromEntries(
    Object.entries(errors).map(([field, error]) => [field, validationMessage(t, error as ValidationError)]),
  ) as Partial<Record<K, string>>;
}
