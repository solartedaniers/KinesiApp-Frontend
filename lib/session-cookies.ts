import { IS_PRODUCTION, SESSION_COOKIE } from "./config";
import { secondsUntilExpiry } from "./jwt";
import type { TokenPair } from "./types";

type CookieOptions = {
  httpOnly: true;
  secure: boolean;
  sameSite: "lax";
  path: "/";
  maxAge: number;
};

export type SessionCookie = { name: string; value: string; options: CookieOptions };

// La cookie vive lo mismo que el token que guarda: la duración la decide el backend (claim exp),
// no un número repetido aquí (§4.2 del diseño)
function cookieFor(name: string, token: string): SessionCookie {
  return {
    name,
    value: token,
    options: { httpOnly: true, secure: IS_PRODUCTION, sameSite: "lax", path: "/", maxAge: secondsUntilExpiry(token) },
  };
}

/** Las dos cookies httpOnly del BFF. Las usan Server Actions y proxy.ts (cada uno con su API de cookies). */
export function sessionCookies(tokens: TokenPair): SessionCookie[] {
  return [
    cookieFor(SESSION_COOKIE.access, tokens.access_token),
    cookieFor(SESSION_COOKIE.refresh, tokens.refresh_token),
  ];
}

export const SESSION_COOKIE_NAMES = [SESSION_COOKIE.access, SESSION_COOKIE.refresh] as const;
