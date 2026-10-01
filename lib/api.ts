import "server-only";

import { apiBaseUrl } from "./config";
import { ApiError, NETWORK_ERROR_CODE, VALIDATION_ERROR_CODE } from "./errors";

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  accessToken?: string;
};

/** Única puerta hacia el backend desde el servidor de Next. Lanza ApiError en cualquier fallo. */
export async function apiRequest<T>(path: string, { method = "GET", body, accessToken }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, NETWORK_ERROR_CODE, "Backend unreachable");
  }

  if (!response.ok) throw await toApiError(response);
  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

async function toApiError(response: Response): Promise<ApiError> {
  const payload = await response.json().catch(() => null);
  // Errores de dominio: {detail, code}. Validación de FastAPI (422): {detail: [...]} sin code
  const code = typeof payload?.code === "string"
    ? payload.code
    : response.status === 422 ? VALIDATION_ERROR_CODE : "generic";
  const detail = typeof payload?.detail === "string" ? payload.detail : response.statusText;
  return new ApiError(response.status, code, detail);
}
