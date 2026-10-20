import { PREFERENCE_COOKIE_MAX_AGE_SECONDS } from "./config";

/** Guarda una preferencia desde el navegador, con las mismas opciones que usa la Server Action. */
export function writePreference(name: string, value: string): void {
  const secure = location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${PREFERENCE_COOKIE_MAX_AGE_SECONDS}; samesite=lax${secure}`;
}

export function readPreference(name: string): string | undefined {
  const match = document.cookie.split("; ").find((pair) => pair.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : undefined;
}
