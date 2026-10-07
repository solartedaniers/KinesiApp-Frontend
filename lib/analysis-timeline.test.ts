// Línea de tiempo del video del análisis. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { angleAt, peakMoments, timelinePercent } from "./analysis-timeline.ts";

const point = (ms: number, degrees: number, id = ms) => ({ id, joint_name: "knee_flexion", angle_degrees: degrees, frame_timestamp_ms: ms });
const knee = [point(0, 10), point(100, 80), point(200, 110), point(300, 110), point(400, 40)];

test("el pico de cada articulación es el primer instante con el ángulo máximo", () => {
  assert.deepEqual(peakMoments([{ joint: "knee_flexion", points: knee }, { joint: "trunk_inclination", points: [] }]), [
    { joint: "knee_flexion", ms: 200, degrees: 110 },
  ]);
});

test("angleAt devuelve la medición más cercana, también fuera de los extremos", () => {
  assert.equal(angleAt(knee, 140)?.angle_degrees, 80);
  assert.equal(angleAt(knee, 160)?.angle_degrees, 110);
  assert.equal(angleAt(knee, 150)?.frame_timestamp_ms, 100);
  assert.equal(angleAt(knee, -50)?.frame_timestamp_ms, 0);
  assert.equal(angleAt(knee, 9000)?.frame_timestamp_ms, 400);
  assert.equal(angleAt([], 10), null);
});

test("timelinePercent se mantiene entre 0 y 100", () => {
  assert.equal(timelinePercent(500, 2000), 25);
  assert.equal(timelinePercent(3000, 2000), 100);
  assert.equal(timelinePercent(-1, 2000), 0);
  assert.equal(timelinePercent(10, 0), 0);
});
