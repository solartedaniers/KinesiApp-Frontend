// Configuración que no es texto de UI ni estilo: entorno, nombres de cookies y márgenes de sesión.

// Antes de que venza la URL firmada del video se pide otra: margen para no reproducir con una vencida
export const VIDEO_URL_RENEW_MARGIN_MS = 5_000;

// Página de los listados por cursor; el backend nunca entrega más de 50 por página
export const LIST_PAGE_SIZE = 50;

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

// Tope de duración de los videos: la cámara se detiene sola y un archivo más largo se rechaza
export const VIDEO_MAX_SECONDS = 40;
