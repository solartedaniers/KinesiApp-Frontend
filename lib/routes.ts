// Rutas de la app en un solo lugar: ningún componente escribe un path suelto.
export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  passwordRecovery: "/password-recovery",
  home: "/home",
  coachAthletes: "/coach/athletes",
  newCoachAthlete: "/coach/athletes/new",
  newAnalysis: "/analysis/new",
  videoConsent: "/analysis/consent",
  legalVideoConsent: "/legal/video-consent",
  // Ficha biométrica obligatoria del deportista antes de entrar a la app por primera vez
  onboarding: "/onboarding",
  changePassword: "/account/password",
  // Route Handlers de sesión: navegación completa (no del router) para descartar su caché
  logout: "/api/session/logout",
  sessionExpired: "/api/session/expired",
} as const;

// Pantallas de acceso: con sesión iniciada no tienen sentido y redirigen a /home
const AUTH_ROUTES: readonly string[] = [ROUTES.login, ROUTES.register, ROUTES.verifyEmail, ROUTES.passwordRecovery];

// Lo que no está aquí ni en AUTH_ROUTES exige sesión: privado por defecto, más seguro ante rutas nuevas
const PUBLIC_PREFIXES: readonly string[] = ["/legal"];
// Los Route Handlers de sesión deben poder correr sin sesión: si fueran privados, /login?next= los
// volvería a llamar después de iniciar sesión y cerraría la sesión recién abierta
const PUBLIC_ROUTES: readonly string[] = [ROUTES.landing, "/manifest.webmanifest", ROUTES.logout, ROUTES.sessionExpired];

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

export function analysisPath(analysisId: number): string {
  return `/analysis/${analysisId}`;
}

export function coachAthletePath(athleteId: number): string {
  return `/coach/athletes/${athleteId}`;
}

export function coachAthleteEditPath(athleteId: number): string {
  return `${coachAthletePath(athleteId)}/edit`;
}

export function newAnalysisPath(athleteId?: number): string {
  return athleteId === undefined ? ROUTES.newAnalysis : `${ROUTES.newAnalysis}?${new URLSearchParams({ [ATHLETE_PARAM]: String(athleteId) })}`;
}

/** Equipos: el coach los gestiona en su sección y el admin en la suya, con las mismas pantallas. */
export function teamsPath(role: "coach" | "admin"): string {
  return `/${role}/teams`;
}

export function teamPath(role: "coach" | "admin", teamId: number): string {
  return `${teamsPath(role)}/${teamId}`;
}

/** Estadísticas del coach filtradas por un equipo. */
export function teamStatsPath(teamId: number): string {
  return `/coach/stats?${new URLSearchParams({ [TEAM_PARAM]: String(teamId) })}`;
}

/** Informe imprimible (Guardar como PDF) de un análisis concreto. */
export function reportPath(analysisId: number): string {
  return `/report/${analysisId}`;
}

export function withNext(path: string, next: string): string {
  return `${path}?${new URLSearchParams({ [NEXT_PARAM]: next })}`;
}

export function withEmail(path: string, email: string): string {
  return `${path}?${new URLSearchParams({ [EMAIL_PARAM]: email })}`;
}
