// Datos de ejemplo de la guía de estilo. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { SAMPLE_ANALYSIS, SAMPLE_DURATION_MS, valueAt } from "./sample-analysis.ts";

test("cubre 40 s a 30 fps con las dos articulaciones y diez repeticiones", () => {
  assert.equal(SAMPLE_ANALYSIS.knee.length, 1200);
  assert.equal(SAMPLE_ANALYSIS.trunk.length, 1200);
  assert.ok(SAMPLE_ANALYSIS.knee.at(-1)!.ms < SAMPLE_DURATION_MS);
  assert.equal(SAMPLE_ANALYSIS.repetitions.length, 10);
});

test("valueAt devuelve la muestra anterior más cercana y null antes del inicio", () => {
  const samples = [{ ms: 0, degrees: 1 }, { ms: 33, degrees: 2 }, { ms: 67, degrees: 3 }];
  assert.equal(valueAt(samples, 50), 2);
  assert.equal(valueAt(samples, 67), 3);
  assert.equal(valueAt(samples, 9999), 3);
  assert.equal(valueAt(samples, -1), null);
  assert.equal(valueAt([], 10), null);
});
