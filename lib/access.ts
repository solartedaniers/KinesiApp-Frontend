// Qué ve cada rol: el equivalente de RouteAccessPolicy + RoleHomeResolver del cliente Flutter (§9.2).
// Es UX, no seguridad: el backend vuelve a autorizar cada request (require_roles, _authorize_athlete_access).
import type { IconName } from "@/components/ui/Icon";

import { ROUTES } from "./routes";
import type { UserRole } from "./types";

export type NavKey = "home" | "analyses" | "stats" | "profile" | "team" | "users" | "assignments";
export type NavItem = {
  key: NavKey;
  href: string;
  icon: IconName;
  /** Otras rutas que marcan esta pestaña como activa (p. ej. /account/password → Perfil). */
  alsoActiveFor?: string[];
};

export const HOME_BY_ROLE: Record<UserRole, string> = {
  athlete: "/athlete",
  coach: "/coach",
  admin: "/admin",
};

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  athlete: [
    { key: "home", href: "/athlete", icon: "home" },
    { key: "analyses", href: "/athlete/analyses", icon: "video" },
    { key: "stats", href: "/athlete/stats", icon: "chart" },
    { key: "profile", href: "/athlete/profile", icon: "user", alsoActiveFor: [ROUTES.changePassword] },
  ],
  coach: [
    { key: "home", href: "/coach", icon: "home" },
    { key: "team", href: "/coach/analyses", icon: "video" },
    { key: "stats", href: "/coach/stats", icon: "chart" },
    { key: "profile", href: "/coach/profile", icon: "user", alsoActiveFor: [ROUTES.changePassword] },
  ],
  admin: [
    { key: "home", href: "/admin", icon: "home" },
    { key: "users", href: "/admin/users", icon: "users" },
    { key: "assignments", href: "/admin/assignments", icon: "link" },
    { key: "profile", href: "/admin/profile", icon: "user", alsoActiveFor: [ROUTES.changePassword] },
  ],
};

// Roles que pueden abrir cada sección; cada layout de sección la consulta. El flujo de análisis
// es de deportista y coach (_analysisRoutes en Flutter)
export const SECTION_ROLES = {
  athlete: ["athlete"],
  coach: ["coach"],
  admin: ["admin"],
  analysis: ["athlete", "coach"],
  account: ["athlete", "coach", "admin"],
} as const satisfies Record<string, readonly UserRole[]>;

export function homeFor(role: UserRole): string {
  return HOME_BY_ROLE[role];
}

/** La pestaña activa: la de href más largo que contenga la ruta (/athlete/stats no activa /athlete). */
export function activeNavHref(items: NavItem[], pathname: string): string | undefined {
  const within = (route: string) => pathname === route || pathname.startsWith(`${route}/`);
  return items
    .filter((item) => within(item.href) || item.alsoActiveFor?.some(within))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;
}
