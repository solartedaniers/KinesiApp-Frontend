import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/server-config";
import { LOCALES } from "@/lib/i18n";
import { guidePath, localizedPath, ROUTES } from "@/lib/routes";
import { MOVEMENT_TYPES } from "@/lib/types";

// Solo el sitio público: lo demás exige sesión y no se indexa
export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [ROUTES.landing, ...MOVEMENT_TYPES.map((movement) => guidePath(movement))];
  return paths.map((path) => ({
    url: `${SITE_ORIGIN}${path}`,
    alternates: { languages: Object.fromEntries(LOCALES.map((locale) => [locale, `${SITE_ORIGIN}${localizedPath(locale, path)}`])) },
  }));
}
