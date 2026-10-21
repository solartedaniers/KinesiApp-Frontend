// Qué ve cada rol: el equivalente de RouteAccessPolicy + RoleHomeResolver del cliente Flutter (§9.2).
// Es UX, no seguridad: el backend vuelve a autorizar cada request (require_roles, _authorize_athlete_access).
import type { GlyphName } from "@/lib/design/icons";

import { ROUTES } from "./routes";
import type { UserRole } from "./types";

export type NavKey = "home" | "analyses" | "capture" | "stats" | "profile" | "athletes" | "teams" | "users" | "assignments";
export type NavItem = {
  key: NavKey;
  href: string;
  glyph: GlyphName;
  /** Otras rutas que marcan esta pestaña como activa (p. ej. /account/password → Perfil). */
  alsoActiveFor?: string[];
};

const HOME_BY_ROLE: Record<UserRole, string> = {
  athlete: "/athlete",
  coach: "/coach",
  admin: "/admin",
};

export const NAV_BY_ROLE: Record<UserRole, NavItem[]> = {
  athlete: [
    { key: "home", href: "/athlete", glyph: "overview" },
    { key: "analyses", href: "/athlete/analyses", glyph: "history" },
    { key: "capture", href: ROUTES.newAnalysis, glyph: "capture" },
    { key: "stats", href: "/athlete/stats", glyph: "trend" },
    { key: "profile", href: "/athlete/profile", glyph: "profile", alsoActiveFor: [ROUTES.changePassword] },
  ],
  coach: [
    { key: "home", href: "/coach", glyph: "overview" },
    { key: "athletes", href: ROUTES.coachAthletes, glyph: "athlete" },
    { key: "teams", href: "/coach/teams", glyph: "team" },
    { key: "analyses", href: "/coach/analyses", glyph: "history" },
    { key: "stats", href: "/coach/stats", glyph: "trend" },
    { key: "profile", href: "/coach/profile", glyph: "profile", alsoActiveFor: [ROUTES.changePassword] },
  ],
  admin: [
    { key: "home", href: "/admin", glyph: "overview" },
    { key: "users", href: "/admin/users", glyph: "roles" },
    { key: "assignments", href: "/admin/assignments", glyph: "link" },
    { key: "teams", href: "/admin/teams", glyph: "team" },
    { key: "profile", href: "/admin/profile", glyph: "profile", alsoActiveFor: [ROUTES.changePassword] },
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

/** Lista de grabaciones del rol: destino de "volver" desde el detalle de un análisis. */
export function analysesListHref(role: UserRole): string {
  const item = NAV_BY_ROLE[role].find((entry) => entry.key === "analyses");
  return item?.href ?? HOME_BY_ROLE[role];
}
