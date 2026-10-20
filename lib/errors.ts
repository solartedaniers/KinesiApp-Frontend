import { rpcReason } from "./grpc/errors";
import { type Dictionary, format } from "./i18n";
import { VALIDATION_PARAMS, type ValidationError } from "./validation";

// Todas reciben el diccionario activo: en el servidor sale de getT(), en el cliente de useT()

/** Mensaje traducido de un motivo estable del backend (o del cliente); el genérico si no se conoce. */
export function codeMessage(t: Dictionary, code: string): string {
  return code in t.errors ? t.errors[code as keyof typeof t.errors] : t.errors.generic;
}

export function errorMessage(t: Dictionary, error: unknown): string {
  return codeMessage(t, error ? rpcReason(error) : "generic");
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
