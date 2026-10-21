// Configuración que no es texto de UI ni estilo y que también usa el navegador. Lo que solo usa el
// servidor está en server-config.ts; los límites de negocio llegan del backend por GetClientPolicy.
import { z } from "zod";

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

// Cookie de un solo uso que deja el login para que la app despierte la IA al entrar
export const AI_WAKE_COOKIE = "kin_ai_wake";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";

function isTimeZone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const publicConfigSchema = z.object({
  // Las fechas se formatean en el servidor, que corre en UTC en Vercel: sin una zona fija, una grabación
  // de las 9:00 se vería a las 14:00. Es pública porque el cliente también formatea y debe coincidir
  NEXT_PUBLIC_APP_TIME_ZONE: z.string().refine(isTimeZone).default("America/Bogota"),
  // Antes de que venza la URL firmada del video pido otra, para no reproducir con una vencida
  NEXT_PUBLIC_VIDEO_URL_RENEW_MARGIN_MS: z.coerce.number().int().positive().default(5_000),
  // Solo es UX: el backend decide si de verdad reenvía el código
  NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().int().positive().default(30),
  NEXT_PUBLIC_PREFERENCE_COOKIE_MAX_AGE_SECONDS: z.coerce.number().int().positive().default(60 * 60 * 24 * 365),
  // Tras un "IA activada" no repito WakeUpAi en este rato: queda por debajo de los 300 s que Azure
  // espera antes de bajar la réplica
  NEXT_PUBLIC_AI_READY_TTL_MS: z.coerce.number().int().positive().default(240_000),
  // Un "encendiendo" más viejo que esto lo doy por perdido (la pestaña que llamaba se cerró): va por
  // encima del AI_WAKE_UP_TIMEOUT_MS del servidor
  NEXT_PUBLIC_AI_WAKE_STALE_MS: z.coerce.number().int().positive().default(90_000),
  // Si la IA responde pero sigue cargando modelos, vuelvo a preguntar cada tanto, con un tope de intentos
  NEXT_PUBLIC_AI_WARMING_RETRY_MS: z.coerce.number().int().positive().default(3_000),
  NEXT_PUBLIC_AI_WARMING_ATTEMPTS: z.coerce.number().int().positive().default(20),
  // La IA manda la pose solo en el instante de cada pico: la dibujo sobre el video mientras el cabezal
  // esté a menos de esto, para que se vea al reproducir y no solo en el cuadro exacto
  NEXT_PUBLIC_RISK_POSE_WINDOW_MS: z.coerce.number().int().positive().default(250),
});

export type PublicConfig = z.infer<typeof publicConfigSchema>;

export function parsePublicConfig(env: Record<string, string | undefined>): PublicConfig {
  return publicConfigSchema.parse(env);
}

// Next solo incrusta en el bundle del cliente las NEXT_PUBLIC_* leídas con su nombre literal, por eso no
// le paso process.env entero
const config = parsePublicConfig({
  NEXT_PUBLIC_APP_TIME_ZONE: process.env.NEXT_PUBLIC_APP_TIME_ZONE,
  NEXT_PUBLIC_VIDEO_URL_RENEW_MARGIN_MS: process.env.NEXT_PUBLIC_VIDEO_URL_RENEW_MARGIN_MS,
  NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS: process.env.NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS,
  NEXT_PUBLIC_PREFERENCE_COOKIE_MAX_AGE_SECONDS: process.env.NEXT_PUBLIC_PREFERENCE_COOKIE_MAX_AGE_SECONDS,
  NEXT_PUBLIC_AI_READY_TTL_MS: process.env.NEXT_PUBLIC_AI_READY_TTL_MS,
  NEXT_PUBLIC_AI_WAKE_STALE_MS: process.env.NEXT_PUBLIC_AI_WAKE_STALE_MS,
  NEXT_PUBLIC_AI_WARMING_RETRY_MS: process.env.NEXT_PUBLIC_AI_WARMING_RETRY_MS,
  NEXT_PUBLIC_AI_WARMING_ATTEMPTS: process.env.NEXT_PUBLIC_AI_WARMING_ATTEMPTS,
  NEXT_PUBLIC_RISK_POSE_WINDOW_MS: process.env.NEXT_PUBLIC_RISK_POSE_WINDOW_MS,
});

export const APP_TIME_ZONE = config.NEXT_PUBLIC_APP_TIME_ZONE;
export const VIDEO_URL_RENEW_MARGIN_MS = config.NEXT_PUBLIC_VIDEO_URL_RENEW_MARGIN_MS;
export const OTP_RESEND_COOLDOWN_SECONDS = config.NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS;
export const PREFERENCE_COOKIE_MAX_AGE_SECONDS = config.NEXT_PUBLIC_PREFERENCE_COOKIE_MAX_AGE_SECONDS;
export const RISK_POSE_WINDOW_MS = config.NEXT_PUBLIC_RISK_POSE_WINDOW_MS;

// Estado de la IA compartido entre pestañas (Shared Worker o BroadcastChannel)
export const AI_STATUS = {
  readyTtlMs: config.NEXT_PUBLIC_AI_READY_TTL_MS,
  wakeStaleMs: config.NEXT_PUBLIC_AI_WAKE_STALE_MS,
  warmingRetryMs: config.NEXT_PUBLIC_AI_WARMING_RETRY_MS,
  warmingAttempts: config.NEXT_PUBLIC_AI_WARMING_ATTEMPTS,
} as const;
