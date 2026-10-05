// Lógica del admin. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { accountStatus, systemSummary, unassignedFirst } from "./admin-stats.ts";
import type { AthleteProfile, User } from "./types.ts";

const user = (id: number, role: User["role"], is_verified: boolean, is_active: boolean): User => ({
  id, email: `u${id}@k.app`, full_name: `U${id}`, role, is_active, is_verified, created_at: "2026-09-01T00:00:00Z", avatar_url: null, video_consent_version: null,
});
const athlete = (id: number, name: string, coach_id: number | null): AthleteProfile => ({
  id, user_id: null, coach_id, coach_name: null, display_name: name, display_avatar: null, is_managed: true, gender: "other", height_cm: 170, weight_kg: 60, birth_date: "2000-01-01",
});

test("estado de la cuenta: sin verificar no es deshabilitada", () => {
  assert.equal(accountStatus({ is_verified: false, is_active: false }), "unverified");
  assert.equal(accountStatus({ is_verified: true, is_active: true }), "active");
  assert.equal(accountStatus({ is_verified: true, is_active: false }), "disabled");
});

test("resumen del sistema", () => {
  const users = [user(1, "admin", true, true), user(2, "coach", true, true), user(3, "coach", false, false), user(4, "athlete", true, true)];
  const athletes = [athlete(1, "Bea", 2), athlete(2, "Ana", null), athlete(3, "Ciro", null)];
  assert.deepEqual(systemSummary(users, athletes), { users: 4, coaches: 2, athletes: 3, unassigned: 2, pendingVerification: 1 });
});

test("sin entrenador primero y luego por nombre", () => {
  const sorted = unassignedFirst([athlete(1, "Bea", 2), athlete(2, "Ciro", null), athlete(3, "Ana", null), athlete(4, "Álvaro", 2)], "es");
  assert.deepEqual(sorted.map((a) => a.display_name), ["Ana", "Ciro", "Álvaro", "Bea"]);
});
