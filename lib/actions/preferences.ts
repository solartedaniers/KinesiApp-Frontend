"use server";

import { refresh } from "next/cache";
import { cookies } from "next/headers";

import { IS_PRODUCTION, PREFERENCE_COOKIE, PREFERENCE_COOKIE_MAX_AGE_SECONDS } from "../config";
import { isLocale } from "../i18n";

/**
 * Idioma de la interfaz elegido por el usuario; vale para todas las páginas, con o sin sesión. Va al
 * servidor porque los textos se renderizan allí; el tema no lo necesita y se cambia en el navegador.
 */
export async function setLocale(locale: string): Promise<void> {
  if (!isLocale(locale)) return;
  // Sin httpOnly: las páginas estáticas la leen en el navegador (no es un secreto)
  (await cookies()).set(PREFERENCE_COOKIE.locale, locale, {
    httpOnly: false,
    secure: IS_PRODUCTION,
    sameSite: "lax",
    path: "/",
    maxAge: PREFERENCE_COOKIE_MAX_AGE_SECONDS,
  });
  refresh();
}
