import type { MetadataRoute } from "next";

import { ROUTES } from "@/lib/routes";
import { THEME_COLOR } from "@/lib/theme";
import { DEFAULT_LOCALE, DICTIONARIES } from "@/lib/i18n";

// El manifest es uno solo para todos (lo cachea el navegador al instalar): va en el idioma por defecto
export default function manifest(): MetadataRoute.Manifest {
  const t = DICTIONARIES[DEFAULT_LOCALE];
  return {
    name: t.app.name,
    short_name: t.app.name,
    description: t.app.description,
    start_url: ROUTES.home,
    display: "standalone",
    background_color: THEME_COLOR.dark,
    theme_color: THEME_COLOR.brand,
    icons: [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
