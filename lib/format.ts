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
