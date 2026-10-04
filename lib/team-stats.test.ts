// Estadísticas filtradas y agrupadas por equipo. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { findTeam, scopeToTeam, statsByTeam } from "./team-stats.ts";
import type { AthleteProfile, JumpAnalysis, Team } from "./types.ts";

const athlete = (id: number): AthleteProfile => ({
  id, user_id: null, coach_id: 1, display_name: `A${id}`, display_avatar: null, is_managed: true,
  gender: "female", height_cm: 160, weight_kg: 55, birth_date: "2008-01-01",
});
const analysis = (id: number, athleteId: number, score: number | null): JumpAnalysis => ({
  id, athlete_id: athleteId, movement_type: "jump", status: score === null ? "pending" : "processed",
  risk_score: score, recorded_at: `2026-09-0${id}T10:00:00Z`, angle_measurements: [],
});
const team = (id: number, athleteIds: number[]): Team => ({ id, name: `T${id}`, owner_id: 1, athlete_ids: athleteIds, created_at: "2026-09-01T00:00:00Z" });

const ATHLETES = [athlete(1), athlete(2), athlete(3)];
const ANALYSES = [analysis(1, 1, 0.2), analysis(2, 2, 0.8), analysis(3, 3, null), analysis(4, 1, 0.4)];

test("filtrar por equipo deja sólo a sus miembros y sus grabaciones", () => {
  const scoped = scopeToTeam(ATHLETES, ANALYSES, team(9, [1, 3]));
  assert.deepEqual(scoped.athletes.map((a) => a.id), [1, 3]);
  assert.deepEqual(scoped.analyses.map((a) => a.id), [1, 3, 4]);
  assert.deepEqual(scopeToTeam(ATHLETES, ANALYSES, undefined).analyses.length, 4);
});

test("cada equipo resume sus propias grabaciones; un deportista puede contar en dos", () => {
  const [first, second, empty] = statsByTeam([team(1, [1]), team(2, [1, 2]), team(3, [])], ANALYSES);
  assert.equal(first.stats.total, 2);
  assert.ok(Math.abs((first.stats.averageRisk ?? 0) - 0.3) < 1e-9);
  assert.equal(second.stats.total, 3);
  assert.equal(second.athletes, 2);
  assert.equal(empty.stats.averageRisk, null);
});

test("el ?team= sólo selecciona equipos propios", () => {
  const teams = [team(5, [])];
  assert.equal(findTeam(teams, "5")?.id, 5);
  assert.equal(findTeam(teams, "6"), undefined);
  assert.equal(findTeam(teams, undefined), undefined);
  assert.equal(findTeam(teams, ["5", "6"])?.id, 5);
});
