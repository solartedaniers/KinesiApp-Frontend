import type { MetadataRoute } from "next";

import { SITE_ORIGIN } from "@/lib/config";

// Lo privado ya redirige al login; aquí solo indico dónde está el mapa del sitio público
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_ORIGIN}/sitemap.xml` };
}
