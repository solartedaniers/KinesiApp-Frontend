import { DEFAULT_LOCALE, type Locale } from "./i18n/locale.ts";
import type { MovementType } from "./types.ts";

// Rutas de la app en un solo lugar: ningún componente escribe un path suelto.
export const ROUTES = {
  landing: "/",
  guide: "/guide",
  offline: "/offline",
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  passwordRecovery: "/password-recovery",
  home: "/home",
  coachAthletes: "/coach/athletes",
  newCoachAthlete: "/coach/athletes/new",
  newAnalysis: "/analyses/new",
  videoConsent: "/analyses/consent",
  legalVideoConsent: "/legal/video-consent",
  // Ficha biométrica obligatoria del deportista antes de entrar a la app por primera vez
  onboarding: "/onboarding",
  changePassword: "/account/password",
  // Route Handlers de sesión: navegación completa (no del router) para descartar su caché
  logout: "/api/session/logout",
  sessionExpired: "/api/session/expired",
  // Comprobación del transporte gRPC-Web: la dejo pública para poder probarla sin el backend REST
  systemPing: "/system/ping",
  // Guía de estilo del rediseño: pública para revisarla en el preview sin cuenta
  styleGuide: "/style-guide",
  styleGuideScreen: (screen: "home" | "analysis" | "capture") => `/style-guide/screens/${screen}`,
} as const;

// Pantallas de acceso: con sesión iniciada no tienen sentido y redirigen a /home
const AUTH_ROUTES: readonly string[] = [ROUTES.login, ROUTES.register, ROUTES.verifyEmail, ROUTES.passwordRecovery];

// Lo que no está aquí ni en AUTH_ROUTES exige sesión: privado por defecto, más seguro ante rutas nuevas
const PUBLIC_PREFIXES: readonly string[] = ["/legal", ROUTES.styleGuide, ROUTES.guide, "/en"];
// Los Route Handlers de sesión deben poder correr sin sesión: si fueran privados, /login?next= los
// volvería a llamar después de iniciar sesión y cerraría la sesión recién abierta
const PUBLIC_ROUTES: readonly string[] = [ROUTES.landing, ROUTES.offline, "/manifest.webmanifest", "/sitemap.xml", "/robots.txt", ROUTES.logout, ROUTES.sessionExpired, ROUTES.systemPing];

function matches(pathname: string, route: string): boolean {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => matches(pathname, route));
}

export function isPrivateRoute(pathname: string): boolean {
  return !isAuthRoute(pathname)
    && !PUBLIC_ROUTES.includes(pathname)
    && !PUBLIC_PREFIXES.some((prefix) => matches(pathname, prefix));
}

/** Páginas públicas por idioma: el español va sin prefijo (`/guide/jump`) y el inglés con `/en`. */
export function localizedPath(locale: Locale, path: string): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === ROUTES.landing ? `/${locale}` : `/${locale}${path}`;
}

export function guidePath(movement: MovementType, locale: Locale = DEFAULT_LOCALE): string {
  return localizedPath(locale, `${ROUTES.guide}/${movement}`);
}

export const NEXT_PARAM = "next";
export const EMAIL_PARAM = "email";
export const ATHLETE_PARAM = "athlete";
export const TEAM_PARAM = "team";

/** Sólo rutas internas: evita redirecciones abiertas con `?next=//otro-sitio.com`. */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  return value;
}

/** Id de la URL (`/analyses/12`, `?athlete=3`) si es un entero positivo; null si no. Lo dejo en string como el contrato. */
export function parseId(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;
  return raw && /^[1-9]\d{0,18}$/.test(raw) ? raw : null;
}

export function analysisPath(analysisId: string): string {
  return `/analyses/${analysisId}`;
}

export function coachAthletePath(athleteId: string): string {
  return `/coach/athletes/${athleteId}`;
}

export function coachAthleteEditPath(athleteId: string): string {
  return `${coachAthletePath(athleteId)}/edit`;
}

export function newAnalysisPath(athleteId?: string): string {
  return athleteId === undefined ? ROUTES.newAnalysis : `${ROUTES.newAnalysis}?${new URLSearchParams({ [ATHLETE_PARAM]: String(athleteId) })}`;
}

/** Equipos: el coach los gestiona en su sección y el admin en la suya, con las mismas pantallas. */
export function teamsPath(role: "coach" | "admin"): string {
  return `/${role}/teams`;
}

export function teamPath(role: "coach" | "admin", teamId: string): string {
  return `${teamsPath(role)}/${teamId}`;
}

/** Estadísticas del coach filtradas por un equipo. */
export function teamStatsPath(teamId: string): string {
  return `/coach/stats?${new URLSearchParams({ [TEAM_PARAM]: String(teamId) })}`;
}

export function withNext(path: string, next: string): string {
  return `${path}?${new URLSearchParams({ [NEXT_PARAM]: next })}`;
}

export function withEmail(path: string, email: string): string {
  return `${path}?${new URLSearchParams({ [EMAIL_PARAM]: email })}`;
}
