// Idiomas de la interfaz: un diccionario JSON por idioma. Compartido por servidor y cliente: el
// diccionario activo se obtiene con getT() (lib/i18n/server.ts) en Server Components y Server
// Actions, y con useT() (lib/i18n/client.tsx) en Client Components.
import en from "./en.json";
import es from "./es.json";
import type { Locale } from "./locale";

export { DEFAULT_LOCALE, format, isLocale, type Locale, LOCALES, resolveLocale } from "./locale";

// `joints` se indexa con el nombre de articulación que manda el backend, que puede ser nuevo
export type Dictionary = Omit<typeof es, "joints"> & { joints: Record<string, string> };

// El tipo obliga a que en.json tenga exactamente las mismas claves que es.json
export const DICTIONARIES: Record<Locale, Dictionary> = { es, en };
