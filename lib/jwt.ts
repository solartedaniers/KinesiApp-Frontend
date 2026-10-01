// Lee `exp` sin verificar la firma: sólo decide cuánto dura la cookie y cuándo renovar.
// La verificación real la hace el backend en cada request.
export function readTokenExpiry(token: string): number | null {
  const payload = token.split(".")[1];
  if (!payload) return null;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

/** Segundos de vida restantes; 0 si ya venció o no se puede leer. */
export function secondsUntilExpiry(token: string, nowMs: number = Date.now()): number {
  const exp = readTokenExpiry(token);
  return exp === null ? 0 : Math.max(0, Math.floor(exp - nowMs / 1000));
}

/** Renovar antes de que venza (no al fallar): así casi nunca coinciden dos renovaciones (§4.4). */
export function shouldRefresh(accessToken: string | undefined, leewaySeconds: number, nowMs: number = Date.now()): boolean {
  return !accessToken || secondsUntilExpiry(accessToken, nowMs) < leewaySeconds;
}
