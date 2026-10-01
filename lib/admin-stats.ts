// Lógica pura de las pantallas de admin (testeada en admin-stats.test.ts).
import type { AthleteProfile, User } from "./types";

export type AccountStatus = "active" | "unverified" | "disabled";

/** Una cuenta recién registrada es inactiva hasta verificar: eso es "sin verificar", no "deshabilitada". */
export function accountStatus(user: Pick<User, "is_active" | "is_verified">): AccountStatus {
  if (!user.is_verified) return "unverified";
  return user.is_active ? "active" : "disabled";
}

export type SystemSummary = {
  users: number;
  coaches: number;
  athletes: number;
  unassigned: number;
  pendingVerification: number;
};

export function systemSummary(users: User[], athletes: AthleteProfile[]): SystemSummary {
  return {
    users: users.length,
    coaches: users.filter((user) => user.role === "coach").length,
    athletes: athletes.length,
    unassigned: athletes.filter((athlete) => athlete.coach_id === null).length,
    pendingVerification: users.filter((user) => accountStatus(user) === "unverified").length,
  };
}

/** Sin entrenador primero (son los que requieren acción), luego por nombre. */
export function unassignedFirst(athletes: AthleteProfile[], locale: string): AthleteProfile[] {
  return [...athletes].sort(
    (a, b) => Number(a.coach_id !== null) - Number(b.coach_id !== null) || a.display_name.localeCompare(b.display_name, locale),
  );
}
