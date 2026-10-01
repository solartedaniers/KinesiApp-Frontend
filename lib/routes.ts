// Rutas de la app en un solo lugar: ningún componente escribe un path suelto.
export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  passwordRecovery: "/password-recovery",
  home: "/home",
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

/** Sólo rutas internas: evita redirecciones abiertas con `?next=//otro-sitio.com`. */
export function safeNextPath(value: string | null | undefined): string | null {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return null;
  }
  return value;
}

export function withEmail(path: string, email: string): string {
  return `${path}?${new URLSearchParams({ [EMAIL_PARAM]: email })}`;
}
