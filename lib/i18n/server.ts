import "server-only";

import { cookies, headers } from "next/headers";
import { cache } from "react";

import { PREFERENCE_COOKIE } from "../config";
import { createFormatters, type Formatters } from "../format";
import { DICTIONARIES, type Dictionary, type Locale, resolveLocale } from "./index";

/** Idioma del request (cookie o Accept-Language). `cache`: se resuelve una vez por request. */
export const getLocale = cache(async (): Promise<Locale> => {
  const [cookieStore, headerStore] = await Promise.all([cookies(), headers()]);
  return resolveLocale(cookieStore.get(PREFERENCE_COOKIE.locale)?.value, headerStore.get("accept-language"));
});

/** Diccionario activo, para Server Components y Server Actions. */
export const getT = cache(async (): Promise<Dictionary> => DICTIONARIES[await getLocale()]);

/** Formatos de fecha y número del idioma activo. */
export const getFormat = cache(async (): Promise<Formatters> => createFormatters(await getLocale()));
