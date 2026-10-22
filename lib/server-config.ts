import "server-only";

import { z } from "zod";

// Origen público para las URLs absolutas del sitemap. Vercel da el dominio de cada despliegue; SITE_ORIGIN
// lo fija a mano y, sin nada, uso el del servidor local
const vercelHost = process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_BRANCH_URL;

const serverConfigSchema = z.object({
  SITE_ORIGIN: z
    .url({ protocol: /^https?$/ })
    .transform((url) => url.replace(/\/$/, ""))
    .default(vercelHost ? `https://${vercelHost}` : "http://localhost:3000"),
  // El backend nunca entrega más de 50 por página
  LIST_PAGE_SIZE: z.coerce.number().int().min(1).max(50).default(50),
  // Renuevo el access token cuando le queda menos que esto
  ACCESS_REFRESH_LEEWAY_SECONDS: z.coerce.number().int().positive().default(60),
  AI_WAKE_COOKIE_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(60),
});

const config = serverConfigSchema.parse(process.env);

export const SITE_ORIGIN = config.SITE_ORIGIN;
export const LIST_PAGE_SIZE = config.LIST_PAGE_SIZE;
export const ACCESS_REFRESH_LEEWAY_SECONDS = config.ACCESS_REFRESH_LEEWAY_SECONDS;
export const AI_WAKE_COOKIE_MAX_AGE_SECONDS = config.AI_WAKE_COOKIE_MAX_AGE_SECONDS;
