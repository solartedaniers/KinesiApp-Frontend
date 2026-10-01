import { APP_TIME_ZONE } from "./config";
import { LOCALE } from "./i18n";

const dateTime = new Intl.DateTimeFormat(LOCALE, { dateStyle: "medium", timeStyle: "short", timeZone: APP_TIME_ZONE });
const shortDate = new Intl.DateTimeFormat(LOCALE, { day: "numeric", month: "short", timeZone: APP_TIME_ZONE });
const percent = new Intl.NumberFormat(LOCALE, { style: "percent", maximumFractionDigits: 0 });

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));
export const formatShortDate = (iso: string) => shortDate.format(new Date(iso));
/** risk_score ∈ [0, 1] → "42 %". */
export const formatPercent = (fraction: number) => percent.format(fraction);

/** "Ana María Pérez" → "Ana": el saludo usa sólo el primer nombre. */
export const firstName = (fullName: string) => fullName.trim().split(/\s+/)[0] ?? fullName;

const degrees = new Intl.NumberFormat(LOCALE, { style: "unit", unit: "degree", maximumFractionDigits: 0 });
const seconds = new Intl.NumberFormat(LOCALE, { style: "unit", unit: "second", maximumFractionDigits: 2 });
export const formatDegrees = (value: number) => degrees.format(value);
/** Milisegundos desde el inicio del video → "0,4 s". */
export const formatSecondsFromMs = (ms: number) => seconds.format(ms / 1000);

const isoDate = new Intl.DateTimeFormat("en-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: APP_TIME_ZONE });
/** "Hoy" en APP_TIME_ZONE (el servidor corre en UTC): para edades y otros cálculos por fecha. */
export function todayInAppTimeZone(): Date {
  const [year, month, day] = isoDate.format(new Date()).split("-").map(Number);
  return new Date(year, month - 1, day);
}

const centimeters = new Intl.NumberFormat(LOCALE, { style: "unit", unit: "centimeter", maximumFractionDigits: 0 });
const kilograms = new Intl.NumberFormat(LOCALE, { style: "unit", unit: "kilogram", maximumFractionDigits: 1 });
export const formatHeight = (cm: number) => centimeters.format(cm);
export const formatWeight = (kg: number) => kilograms.format(kg);
