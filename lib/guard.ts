import "server-only";

import { redirect } from "next/navigation";

import { homeFor } from "./access";
import { ROUTES } from "./routes";
import { getCurrentUser } from "./session";
import type { User, UserRole } from "./types";

/**
 * Guarda de rol de los layouts (§9.2). Sin sesión válida → cierra la sesión (las cookies sólo
 * se pueden borrar en un Route Handler). Rol sin acceso → a la home de su propio rol.
 */
export async function requireRole(allowed: readonly UserRole[]): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.sessionExpired);
  if (!allowed.includes(user.role)) redirect(homeFor(user.role));
  return user;
}
