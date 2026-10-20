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

// Origen público para las URLs absolutas del sitemap. Vercel da el dominio de cada despliegue; SITE_ORIGIN
// lo fija a mano y, sin nada, uso el del servidor local
const vercelHost = process.env.VERCEL_ENV === "production" ? process.env.VERCEL_PROJECT_PRODUCTION_URL : process.env.VERCEL_BRANCH_URL;
export const SITE_ORIGIN = process.env.SITE_ORIGIN ?? (vercelHost ? `https://${vercelHost}` : "http://localhost:3000");

// Tope de duración de los videos: la cámara se detiene sola y un archivo más largo se rechaza
export const VIDEO_MAX_SECONDS = 40;

// Estado de la IA compartido entre pestañas (Shared Worker o BroadcastChannel)
export const AI_STATUS = {
  // Tras un "IA activada" no repito WakeUpAi en este rato: queda por debajo de los 300 s que Azure
  // espera antes de bajar la réplica
  readyTtlMs: 4 * 60_000,
  // Un "encendiendo" más viejo que esto lo doy por perdido (la pestaña que llamaba se cerró): por encima
  // del AI_WAKE_UP_TIMEOUT_MS del servidor
  wakeStaleMs: 90_000,
  // Si la IA responde pero sigue cargando modelos, vuelvo a preguntar cada tanto, con un tope de intentos
  warmingRetryMs: 3_000,
  warmingAttempts: 20,
} as const;

// Cookie de un solo uso que deja el login para que la app despierte la IA al entrar
export const AI_WAKE_COOKIE = "kin_ai_wake";
export const AI_WAKE_COOKIE_MAX_AGE_SECONDS = 60;
