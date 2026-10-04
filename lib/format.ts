import { APP_TIME_ZONE } from "./config";
import type { Locale } from "./i18n";

export type Formatters = {
  dateTime: (iso: string) => string;
  shortDate: (iso: string) => string;
  /** risk_score ∈ [0, 1] → "42 %". */
  percent: (fraction: number) => string;
  degrees: (value: number) => string;
  /** Milisegundos desde el inicio del video → "0,4 s". */
  secondsFromMs: (ms: number) => string;
  height: (cm: number) => string;
  weight: (kg: number) => string;
};

// Construir un Intl.*Format es caro: uno por idioma, reutilizado entre requests y renders
const cachedFormatters = new Map<Locale, Formatters>();

/** Formatos de fecha y número del idioma; servidor: getFormat(), cliente: useFormat(). */
export function createFormatters(locale: Locale): Formatters {
  const cached = cachedFormatters.get(locale);
  if (cached) return cached;
  const dateTime = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: APP_TIME_ZONE });
  const shortDate = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: APP_TIME_ZONE });
  const percent = new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 });
  const degrees = new Intl.NumberFormat(locale, { style: "unit", unit: "degree", maximumFractionDigits: 0 });
  const seconds = new Intl.NumberFormat(locale, { style: "unit", unit: "second", maximumFractionDigits: 2 });
  const centimeters = new Intl.NumberFormat(locale, { style: "unit", unit: "centimeter", maximumFractionDigits: 0 });
  const kilograms = new Intl.NumberFormat(locale, { style: "unit", unit: "kilogram", maximumFractionDigits: 1 });
  const formatters: Formatters = {
    dateTime: (iso) => dateTime.format(new Date(iso)),
    shortDate: (iso) => shortDate.format(new Date(iso)),
    percent: (fraction) => percent.format(fraction),
    degrees: (value) => degrees.format(value),
    secondsFromMs: (ms) => seconds.format(ms / 1000),
    height: (cm) => centimeters.format(cm),
    weight: (kg) => kilograms.format(kg),
  };
  cachedFormatters.set(locale, formatters);
  return formatters;
}

/** "Ana María Pérez" → "Ana": el saludo usa sólo el primer nombre. */
export const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? fullName;

// "en-CA" no es un idioma de la interfaz: es el formato que da yyyy-mm-dd
const isoDate = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: APP_TIME_ZONE });
/** "Hoy" en APP_TIME_ZONE (el servidor corre en UTC): para edades y otros cálculos por fecha. */
export function todayInAppTimeZone(): Date {
  const [year, month, day] = isoDate.format(new Date()).split("-").map(Number);
  return new Date(year, month - 1, day);
}
