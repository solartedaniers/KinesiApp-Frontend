// Rutas de la app en un solo lugar: ningún componente escribe un path suelto.
export const ROUTES = {
  landing: "/",
  login: "/login",
  register: "/register",
  verifyEmail: "/verify-email",
  passwordRecovery: "/password-recovery",
  home: "/home",
  changePassword: "/account/password",
} as const;

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
