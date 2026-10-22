// Lógica pura de las pantallas de admin (testeada en admin-stats.test.ts).
import type { AthleteProfile, AdminUser } from "./types";

export type AccountStatus = "active" | "unverified" | "disabled";

/** Una cuenta recién registrada es inactiva hasta verificar: eso es "sin verificar", no "deshabilitada". */
export function accountStatus(user: Pick<AdminUser, "is_active" | "is_verified">): AccountStatus {
  if (!user.is_verified) return "unverified";
  return user.is_active ? "active" : "disabled";
}

export type SystemSummary = {
  users: number;
  admins: number;
  coaches: number;
  athleteAccounts: number;
  athletes: number;
  unassigned: number;
  pendingVerification: number;
  disabled: number;
};

export function systemSummary(users: AdminUser[], athletes: AthleteProfile[]): SystemSummary {
  return {
    users: users.length,
    admins: users.filter((user) => user.role === "admin").length,
    coaches: users.filter((user) => user.role === "coach").length,
    athleteAccounts: users.filter((user) => user.role === "athlete").length,
    athletes: athletes.length,
    unassigned: athletes.filter((athlete) => athlete.coach_id === null).length,
    pendingVerification: users.filter((user) => accountStatus(user) === "unverified").length,
    disabled: users.filter((user) => accountStatus(user) === "disabled").length,
  };
}

/** Sin entrenador primero (son los que requieren acción), luego por nombre. */
export function unassignedFirst(athletes: AthleteProfile[], locale: string): AthleteProfile[] {
  return [...athletes].sort(
    (a, b) => Number(a.coach_id !== null) - Number(b.coach_id !== null) || a.display_name.localeCompare(b.display_name, locale),
  );
}
