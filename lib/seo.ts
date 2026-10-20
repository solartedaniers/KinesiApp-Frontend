import type { Metadata } from "next";

import { DEFAULT_LOCALE, LOCALES, type Locale } from "./i18n/locale.ts";
import { localizedPath } from "./routes.ts";

/** Canonical y hreflang de una página pública: cada idioma apunta a su versión y x-default al español. */
export function localeAlternates(path: string, locale: Locale): Metadata["alternates"] {
  return {
    canonical: localizedPath(locale, path),
    languages: {
      ...Object.fromEntries(LOCALES.map((option) => [option, localizedPath(option, path)])),
      "x-default": localizedPath(DEFAULT_LOCALE, path),
    },
  };
}
