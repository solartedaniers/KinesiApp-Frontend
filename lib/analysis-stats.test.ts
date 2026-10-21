// Estadísticas de análisis. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { ageOn, computeStatistics, riskLevel, riskTrend, sortByRecordedDesc, statsByAthlete } from "./analysis-stats.ts";
import type { AnalysisSummary } from "./types.ts";

const analysis = (id: number, day: number, status: AnalysisSummary["status"], risk: number | null): AnalysisSummary => ({
  id: String(id),
  athlete_id: "1",
  movement_type: "jump",
  status,
  risk_score: risk,
  recorded_at: `2026-09-${String(day).padStart(2, "0")}T10:00:00Z`,
  risk_level: null,
  dominant_risk_pattern: null,
  failure_reason: null,
  knee_median_peak_degrees: null,
  knee_target: null,
});

const sample = [
  analysis(1, 3, "processed", 0.2),
  analysis(2, 10, "processed", 0.8),
  analysis(3, 7, "failed", null),
  analysis(4, 12, "pending", null),
  analysis(5, 5, "processed", 0.66),
];

test("estadísticas: conteos, promedio, máximo y riesgo alto (>= 0.66)", () => {
  const stats = computeStatistics(sample);
  assert.equal(stats.total, 5);
  assert.deepEqual([stats.processed, stats.pending, stats.failed], [3, 1, 1]);
  assert.ok(Math.abs((stats.averageRisk ?? 0) - (0.2 + 0.8 + 0.66) / 3) < 1e-9);
  assert.equal(stats.highestRisk, 0.8);
  assert.equal(stats.highRiskCount, 2);
  assert.equal(stats.lastRecordedAt, "2026-09-12T10:00:00Z");
});

test("estadísticas de una lista vacía no inventan valores", () => {
  const stats = computeStatistics([]);
  assert.equal(stats.averageRisk, null);
  assert.equal(stats.highestRisk, null);
  assert.equal(stats.lastRecordedAt, null);
});

test("orden por fecha, tendencia y nivel de riesgo", () => {
  assert.deepEqual(sortByRecordedDesc(sample).map((a) => a.id), ["4", "2", "3", "5", "1"]);
  assert.deepEqual(riskTrend(sample).map((p) => p.analysisId), ["1", "5", "2"]);
  assert.deepEqual([riskLevel(0.1), riskLevel(0.33), riskLevel(0.66)], ["low", "moderate", "high"]);
});

test("estadísticas por deportista y último puntaje", () => {
  const team = [{ ...analysis(10, 1, "processed", 0.5), athlete_id: "2" }, { ...analysis(11, 9, "processed", 0.7), athlete_id: "2" }, ...sample];
  const byAthlete = statsByAthlete(team);
  assert.deepEqual([...byAthlete.keys()].sort(), ["1", "2"]);
  assert.equal(byAthlete.get("2")?.stats.total, 2);
  assert.equal(byAthlete.get("2")?.latestScore, 0.7);
  assert.equal(byAthlete.get("1")?.latestScore, 0.8); // la más reciente con puntaje (la del día 12 está en proceso)
});

test("edad cumplida respeta si ya pasó el cumpleaños", () => {
  assert.equal(ageOn("2003-04-12", new Date(2026, 3, 11)), 22);
  assert.equal(ageOn("2003-04-12", new Date(2026, 3, 12)), 23);
  assert.equal(ageOn("2003-12-31", new Date(2026, 0, 1)), 22);
});
