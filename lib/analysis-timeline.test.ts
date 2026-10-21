// Línea de tiempo del resultado. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildTimeline, CHUNK_SIZE, DRAWN_POINTS, forEachInTasks, valueAt, yieldToMain } from "./analysis-timeline.ts";
import type { JointAngleMeasurement, RiskAssessment } from "./types.ts";

const sample = (id: number, joint: JointAngleMeasurement["joint_name"], ms: number, degrees: number): JointAngleMeasurement => ({ id, joint_name: joint, frame_timestamp_ms: ms, angle_degrees: degrees });

test("recorre todo por partes y cede el hilo entre cada una", async () => {
  const items = Array.from({ length: CHUNK_SIZE * 2 + 5 }, (_, i) => i);
  let pauses = 0;
  let seen = 0;
  await forEachInTasks(items, () => seen++, async () => void pauses++);
  assert.equal(seen, items.length);
  assert.equal(pauses, 2);
});

test("el cede-turno de respaldo termina con MessageChannel", async () => {
  await yieldToMain();
});

test("separa por articulación, ordena, reduce lo dibujado y ubica el pico de cada repetición", async () => {
  // Llegan desordenadas a propósito: la serie debe quedar en orden temporal
  const knee = Array.from({ length: 1000 }, (_, i) => sample(i, "knee_flexion", (999 - i) * 33, 40 + ((999 - i) % 100)));
  const trunk = [sample(2000, "trunk_inclination", 0, 10), sample(2001, "trunk_inclination", 500, 20)];
  const assessment: RiskAssessment = {
    risk_score: 0.5,
    risk_level: "moderate",
    dominant_pattern: null,
    patterns: [{ code: "rigid_landing", score: 0.5, repetitions_triggered: 1, signals: [{ code: "knee_rigid", joint: "knee_flexion", direction: "lower_is_riskier", onset_degrees: 60, saturation_degrees: 30, measured: null, score_median: null }] }],
    repetitions: [{ start_ms: 0, end_ms: 3300, pattern_scores: [{ code: "rigid_landing", score: 0.8, measured_degrees: null }], signal_scores: [{ code: "knee_rigid", score: 0.8, measured_degrees: 138 }] }],
  };
  const timeline = await buildTimeline([...knee, ...trunk], assessment, async () => undefined);
  assert.equal(timeline.fullKnee.length, 1000);
  assert.ok(timeline.fullKnee.every((s, i, all) => i === 0 || all[i - 1].ms <= s.ms));
  assert.equal(timeline.knee.length, DRAWN_POINTS);
  assert.deepEqual(timeline.trunk, [{ ms: 0, degrees: 10 }, { ms: 500, degrees: 20 }]);
  assert.deepEqual(timeline.repetitions[0], { startMs: 0, endMs: 3300, level: "high", peak: { ms: 99 * 33, degrees: 138 } });
  assert.equal(timeline.durationMs, 999 * 33);
});

test("el valor del instante es la última muestra anterior", () => {
  const series = [{ ms: 0, degrees: 5 }, { ms: 100, degrees: 50 }, { ms: 200, degrees: 90 }];
  assert.equal(valueAt(series, 150), 50);
  assert.equal(valueAt(series, 200), 90);
  assert.equal(valueAt([], 10), null);
});
