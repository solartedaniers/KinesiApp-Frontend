// Zonas del rango de flexión. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { type KneeTarget, zoneOf, zonesOf, zoneSpans } from "./signals.ts";

// Formas de los rangos que arma el backend: el salto con los dos límites y la sentadilla sin tope
const JUMP: KneeTarget = { low: 60, high: 80 };
const SQUAT: KneeTarget = { low: 90, high: null };

test("cada valor cae en su zona y los bordes del objetivo cuentan como dentro", () => {
  assert.equal(zoneOf(59, JUMP), "under");
  assert.equal(zoneOf(60, JUMP), "target");
  assert.equal(zoneOf(80, JUMP), "target");
  assert.equal(zoneOf(81, JUMP), "over");
});

test("sin tope no hay zona por encima", () => {
  assert.equal(zoneOf(140, SQUAT), "target");
  assert.deepEqual(zonesOf(SQUAT), ["under", "target"]);
  assert.deepEqual(zonesOf(JUMP), ["under", "target", "over"]);
});

test("los tramos cubren la escala completa sin huecos y descartan los vacíos", () => {
  assert.deepEqual(zoneSpans(150, JUMP), [
    { zone: "under", from: 0, to: 60 },
    { zone: "target", from: 60, to: 80 },
    { zone: "over", from: 80, to: 150 },
  ]);
  assert.deepEqual(zoneSpans(150, SQUAT), [
    { zone: "under", from: 0, to: 90 },
    { zone: "target", from: 90, to: 150 },
  ]);
  assert.deepEqual(zoneSpans(50, JUMP).map((s) => s.zone), ["under"]);
});
