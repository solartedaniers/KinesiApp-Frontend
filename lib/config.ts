// Configuración que no es texto de UI ni estilo: entorno, nombres de cookies y márgenes de sesión.

export function apiBaseUrl(): string {
  const value = process.env.API_BASE_URL;
  if (!value) {
    throw new Error("API_BASE_URL is not set (see frontend/.env.example)");
  }
  return value.replace(/\/$/, "");
}

/** Base de la API vista desde el navegador: sólo para el `src` del <video> (§6). Se incrusta en el build. */
export function publicApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!value) throw new Error("NEXT_PUBLIC_API_BASE_URL is not set (see frontend/.env.example)");
  return value.replace(/\/$/, "");
}

// Consulta del estado de un análisis en proceso: backoff exponencial con techo y un límite de
// intentos para no sondear para siempre (video-analysis-pipeline.md §7)
export const ANALYSIS_POLLING = { initialDelayMs: 2_000, maxDelayMs: 30_000, maxAttempts: 20 } as const;

// Antes de que venza la URL firmada del video se pide otra: margen para no reproducir con una vencida
export const VIDEO_URL_RENEW_MARGIN_MS = 5_000;

// Tamaño de página de los listados de admin (GET /users, GET /athletes usan skip/limit)
export const ADMIN_PAGE_SIZE = 100;

export const SESSION_COOKIE = {
  access: "kin_at",
  refresh: "kin_rt",
} as const;

// Preferencias del usuario (no son secretas ni de sesión): el servidor las lee para renderizar ya
// en el idioma y el tema correctos, sin parpadeo
export const PREFERENCE_COOKIE = {
  locale: "kin_locale",
  theme: "kin_theme",
} as const;
export const PREFERENCE_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

// Se renueva el access token cuando le queda menos que esto (§4.4 del diseño)
export const ACCESS_REFRESH_LEEWAY_SECONDS = 60;

// Espera entre reenvíos de un código OTP (sólo UX: el backend decide si lo envía)
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

// Las fechas se formatean en el servidor (SSR), que corre en UTC en Vercel: sin una zona fija, una
// grabación de las 9:00 se vería a las 14:00. Configurable con APP_TIME_ZONE (IANA)
export const APP_TIME_ZONE = process.env.APP_TIME_ZONE ?? "America/Bogota";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
