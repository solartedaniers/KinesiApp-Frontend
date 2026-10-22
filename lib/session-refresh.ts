import { authGateway } from "./grpc/auth-gateway";
import { Code, rpcCode } from "./grpc/errors";
import type { TokenPair } from "./types";

export type RefreshResult =
  | { status: "refreshed"; tokens: TokenPair }
  /** El backend rechazó el refresh token (vencido, revocado o ya rotado): la sesión terminó. */
  | { status: "revoked" }
  /** Falla de red o del backend: no se sabe, así que no se borra la sesión. */
  | { status: "unavailable" };

export async function refreshSession(refreshToken: string): Promise<RefreshResult> {
  try {
    return { status: "refreshed", tokens: await authGateway().refresh(refreshToken) };
  } catch (error) {
    return rpcCode(error) === Code.Unauthenticated ? { status: "revoked" } : { status: "unavailable" };
  }
}
