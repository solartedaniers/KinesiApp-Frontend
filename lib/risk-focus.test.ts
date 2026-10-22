// Foco del riesgo por repetición. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { buildTimeline } from "./analysis-timeline.ts";
import { focusBones, focusJointText, focusNear, repetitionFocus, valgusSummary } from "./risk-focus.ts";
import type { JointAngleMeasurement, RiskAssessment, RiskSignal } from "./types.ts";

const signal = (code: string, side: RiskSignal["side"]): RiskSignal => ({
  code,
  joint: "knee_valgus",
  direction: "higher_is_riskier",
  onset_degrees: 10,
  saturation_degrees: 25,
  measured: null,
  score_median: null,
  side,
});
const keyframe = { ms: 1200, points: { right_hip: { x: 0.6, y: 0.5 }, right_knee: { x: 0.55, y: 0.7 }, right_ankle: { x: 0.6, y: 0.9 } } };
const frontal: RiskAssessment = {
  risk_score: 0.8,
  risk_level: "high",
  dominant_pattern: "knee_valgus_right",
  camera_view: "front",
  warnings: [],
  patterns: [
    { code: "knee_valgus_left", score: 0.1, repetitions_triggered: 0, signals: [signal("knee_valgus_left", "left")] },
    { code: "knee_valgus_right", score: 0.8, repetitions_triggered: 1, signals: [signal("knee_valgus_right", "right")] },
  ],
  repetitions: [
    {
      start_ms: 1000,
      end_ms: 2000,
      pattern_scores: [
        { code: "knee_valgus_left", score: 0.1, measured_degrees: 11, side: "left", peak_ms: 1100 },
        { code: "knee_valgus_right", score: 0.8, measured_degrees: 22, side: "right", peak_ms: 1200 },
      ],
      signal_scores: [
        { code: "knee_valgus_left", score: 0.1, measured_degrees: 11, side: "left", peak_ms: 1100 },
        { code: "knee_valgus_right", score: 0.8, measured_degrees: 22, side: "right", peak_ms: 1200 },
      ],
      keyframes: [keyframe],
    },
    { start_ms: 3000, end_ms: 4000, pattern_scores: [], signal_scores: [], keyframes: [] },
  ],
};
const valgus = (id: number, side: "left" | "right", ms: number, degrees: number): JointAngleMeasurement => ({ id, joint_name: "knee_valgus", side, frame_timestamp_ms: ms, angle_degrees: degrees });
const text = {
  riskJoint: { knee_flexion: "flexión de la rodilla {side}", trunk_inclination: "inclinación del tronco", knee_valgus: "rodilla {side} hacia adentro" },
  riskJointBoth: { knee_flexion: "flexión de rodilla", trunk_inclination: "inclinación del tronco", knee_valgus: "rodillas hacia adentro" },
  sides: { left: "izquierda", right: "derecha" },
};

test("el foco es la señal del peor patrón, con su pierna, su instante y la pose de ese instante", () => {
  assert.deepEqual(repetitionFocus(frontal, frontal.repetitions[0]), { joint: "knee_valgus", side: "right", ms: 1200, degrees: 22, score: 0.8, keyframe });
  assert.equal(repetitionFocus(frontal, frontal.repetitions[1]), null);
});

test("sólo se dibuja el foco con pose que cae cerca del instante del video", () => {
  const focus = repetitionFocus(frontal, frontal.repetitions[0]);
  const items = [{ focus }, { focus: null }];
  assert.equal(focusNear(items, 1300, 250), items[0]);
  assert.equal(focusNear(items, 1600, 250), null);
  assert.equal(focusNear([{ focus: { ...focus!, keyframe: null } }], 1200, 250), null);
});

test("nombra la articulación y el lado, y resalta sólo la pierna en riesgo", () => {
  assert.equal(focusJointText({ joint: "knee_valgus", side: "right" }, text), "Rodilla derecha hacia adentro");
  assert.equal(focusJointText({ joint: "knee_valgus", side: null }, text), "Rodillas hacia adentro");
  const focus = repetitionFocus(frontal, frontal.repetitions[0])!;
  assert.deepEqual(focusBones(focus), { bones: [["right_hip", "right_knee"], ["right_knee", "right_ankle"]], joint: ["right_knee"] });
  assert.deepEqual(focusBones({ ...focus, joint: "trunk_inclination" }).joint, ["left_hip", "right_hip"]);
});

test("resume el valgo de cada pierna y la diferencia con la mediana de los picos por repetición", () => {
  const samples = [valgus(1, "left", 1100, 11), valgus(2, "left", 1500, 4), valgus(3, "right", 1200, 22), valgus(4, "left", 3500, -3), valgus(5, "right", 3500, 5)];
  assert.deepEqual(valgusSummary(samples, frontal.repetitions), { left: 4, right: 13.5, asymmetry: 9.5 });
  assert.deepEqual(valgusSummary([], frontal.repetitions), { left: null, right: null, asymmetry: null });
});

test("vista de frente, la línea de tiempo separa las piernas y el pico es el peor de las dos", async () => {
  const samples = [valgus(1, "left", 1100, 11), valgus(2, "right", 1200, 22), valgus(3, "right", 3500, 5)];
  const timeline = await buildTimeline(samples, frontal, { moderate: 0.33, high: 0.66 }, async () => undefined);
  assert.equal(timeline.view, "front");
  assert.deepEqual(timeline.fullPrimary, [{ ms: 1100, degrees: 11 }]);
  assert.deepEqual(timeline.fullSecondary, [{ ms: 1200, degrees: 22 }, { ms: 3500, degrees: 5 }]);
  assert.deepEqual(timeline.repetitions[0].peak, { ms: 1200, degrees: 22 });
  assert.equal(timeline.repetitions[0].focus?.side, "right");
  assert.equal(timeline.repetitions[1].focus, null);
});
