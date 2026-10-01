// Estadísticas de análisis. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { anglesByJoint, computeStatistics, riskLevel, riskTrend, sortByRecordedDesc } from "./analysis-stats.ts";
import type { JumpAnalysis } from "./types.ts";

const analysis = (id: number, day: number, status: JumpAnalysis["status"], risk: number | null): JumpAnalysis => ({
  id,
  athlete_id: 1,
  movement_type: "jump",
  status,
  risk_score: risk,
  recorded_at: `2026-09-${String(day).padStart(2, "0")}T10:00:00Z`,
  angle_measurements: [],
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
  assert.deepEqual(sortByRecordedDesc(sample).map((a) => a.id), [4, 2, 3, 5, 1]);
  assert.deepEqual(riskTrend(sample).map((p) => p.analysisId), [1, 5, 2]);
  assert.deepEqual([riskLevel(0.1), riskLevel(0.33), riskLevel(0.66)], ["low", "moderate", "high"]);
});

test("ángulos agrupados por articulación, en orden temporal y con su pico", () => {
  const m = (id: number, joint: string, ms: number, deg: number) => ({ id, joint_name: joint, frame_timestamp_ms: ms, angle_degrees: deg });
  const series = anglesByJoint([m(1, "knee", 400, 48), m(2, "hip", 0, 10), m(3, "knee", 0, 12), m(4, "knee", 200, 35)]);
  assert.deepEqual(series.map((s) => s.joint), ["knee", "hip"]);
  assert.deepEqual(series[0].points.map((p) => p.frame_timestamp_ms), [0, 200, 400]);
  assert.equal(series[0].peak, 48);
  assert.deepEqual(anglesByJoint([]), []);
});
