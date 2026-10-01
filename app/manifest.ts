import type { MetadataRoute } from "next";

import { t } from "@/lib/i18n";
import { ROUTES } from "@/lib/routes";
import { THEME_COLOR } from "@/lib/theme";

// Fase 6 completa íconos y el Service Worker (§7.2)
export default function manifest(): MetadataRoute.Manifest {
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
