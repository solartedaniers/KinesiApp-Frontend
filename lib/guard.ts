import "server-only";

import { redirect } from "next/navigation";

import { homeFor } from "./access";
import { getMyAthleteProfile } from "./data/athletes";
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

/**
 * Un deportista sin ficha biométrica no entra a la app: va a la pantalla obligatoria del primer
 * ingreso. Los otros roles no tienen ficha. El backend igual exige la ficha para subir videos.
 */
export async function requireOnboarded(user: User): Promise<void> {
  if (user.role === "athlete" && !(await getMyAthleteProfile())) redirect(ROUTES.onboarding);
}
