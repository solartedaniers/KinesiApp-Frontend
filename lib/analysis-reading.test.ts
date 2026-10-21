// Lectura de la rodilla por repetición. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { countInTarget, repetitionKneePeaks } from "./analysis-reading.ts";
import type { RiskAssessment, RiskSignal } from "./types.ts";

const signal = (code: string, joint: RiskSignal["joint"]): RiskSignal => ({
  code, joint, direction: "lower_is_riskier", onset_degrees: 60, saturation_degrees: 30, measured: null, score_median: null, side: null,
});

const assessment: RiskAssessment = {
  risk_score: 0.4,
  risk_level: "moderate",
  dominant_pattern: null,
  camera_view: "side",
  warnings: [],
  patterns: [{ code: "rigid_landing", score: 0.4, repetitions_triggered: 1, signals: [signal("knee_rigid", "knee_flexion"), signal("trunk_lean", "trunk_inclination")] }],
  repetitions: [
    { start_ms: 0, end_ms: 900, pattern_scores: [], signal_scores: [{ code: "trunk_lean", score: 0, measured_degrees: 20, side: null, peak_ms: null }, { code: "knee_rigid", score: 0, measured_degrees: 72, side: null, peak_ms: null }], keyframes: [] },
    { start_ms: 900, end_ms: 1800, pattern_scores: [], signal_scores: [{ code: "knee_rigid", score: null, measured_degrees: null, side: null, peak_ms: null }], keyframes: [] },
    { start_ms: 1800, end_ms: 2700, pattern_scores: [], signal_scores: [{ code: "knee_rigid", score: 0.6, measured_degrees: 48, side: null, peak_ms: null }], keyframes: [] },
  ],
};

test("toma el pico de una señal de rodilla, no el de otra articulación, y deja en null lo no medido", () => {
  assert.deepEqual(repetitionKneePeaks(assessment), [72, null, 48]);
});

test("cuenta solo las repeticiones medidas dentro del rango", () => {
  assert.equal(countInTarget([72, null, 48], { low: 60, high: 80 }), 1);
  assert.equal(countInTarget([72, null, 48], { low: 40, high: null }), 2);
});
