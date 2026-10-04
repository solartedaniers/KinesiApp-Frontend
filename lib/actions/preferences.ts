"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";

import { IS_PRODUCTION, PREFERENCE_COOKIE, PREFERENCE_COOKIE_MAX_AGE_SECONDS } from "../config";
import { isLocale } from "../i18n";
import { isTheme } from "../theme";

async function storePreference(name: string, value: string): Promise<void> {
  // httpOnly: sólo la lee el servidor, que renderiza ya con la preferencia aplicada
  (await cookies()).set(name, value, {
    httpOnly: true,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: PREFERENCE_COOKIE_MAX_AGE_SECONDS,
  });
  refresh();
}

/** Idioma de la interfaz elegido por el usuario; vale para todas las páginas, con o sin sesión. */
export async function setLocale(locale: string): Promise<void> {
  if (isLocale(locale)) await storePreference(PREFERENCE_COOKIE.locale, locale);
}

/** Tema claro, oscuro o el del sistema operativo. */
export async function setTheme(theme: string): Promise<void> {
  if (isTheme(theme)) await storePreference(PREFERENCE_COOKIE.theme, theme);
}
