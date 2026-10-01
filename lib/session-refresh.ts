import { apiRequest } from "./api";
import { API_PATHS } from "./api-paths";
import { ApiError } from "./errors";
import type { TokenPair } from "./types";

export type RefreshResult =
  | { status: "refreshed"; tokens: TokenPair }
  /** El backend rechazó el refresh token (vencido, revocado o ya rotado): la sesión terminó. */
  | { status: "revoked" }
  /** Falla de red o del backend: no se sabe, así que no se borra la sesión. */
  | { status: "unavailable" };

export async function refreshSession(refreshToken: string): Promise<RefreshResult> {
  try {
    const tokens = await apiRequest<TokenPair>(API_PATHS.refresh, {
      method: "POST",
      body: { refresh_token: refreshToken },
    });
    return { status: "refreshed", tokens };
  } catch (error) {
    return error instanceof ApiError && error.status === 401 ? { status: "revoked" } : { status: "unavailable" };
  }
}
