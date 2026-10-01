// Configuración que no es texto de UI ni estilo: entorno, nombres de cookies y márgenes de sesión.

export function apiBaseUrl(): string {
  const value = process.env.API_BASE_URL;
  if (!value) {
    throw new Error("API_BASE_URL is not set (see frontend/.env.example)");
  }
  return value.replace(/\/$/, "");
}

export const SESSION_COOKIE = {
  access: "kin_at",
  refresh: "kin_rt",
} as const;

// Se renueva el access token cuando le queda menos que esto (§4.4 del diseño)
export const ACCESS_REFRESH_LEEWAY_SECONDS = 60;

// Espera entre reenvíos de un código OTP (sólo UX: el backend decide si lo envía)
export const OTP_RESEND_COOLDOWN_SECONDS = 30;

// Las fechas se formatean en el servidor (SSR), que corre en UTC en Vercel: sin una zona fija, una
// grabación de las 9:00 se vería a las 14:00. Configurable con APP_TIME_ZONE (IANA)
export const APP_TIME_ZONE = process.env.APP_TIME_ZONE ?? "America/Bogota";

export const IS_PRODUCTION = process.env.NODE_ENV === "production";
