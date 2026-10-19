// Escalas y marcas de las gráficas. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { linear, niceTicks } from "./scale.ts";

test("la escala lineal lleva el dominio al rango, también invertido como el eje y de SVG", () => {
  const y = linear([0, 120], [200, 0]);
  assert.equal(y(0), 200);
  assert.equal(y(120), 0);
  assert.equal(y(60), 100);
});

test("las marcas caen en valores redondos y la última supera el máximo", () => {
  assert.deepEqual(niceTicks(4, 118, 5), [0, 25, 50, 75, 100, 125]);
  assert.deepEqual(niceTicks(0, 1, 4), [0, 0.25, 0.5, 0.75, 1, 1.25]);
  assert.deepEqual(niceTicks(0, 40_000, 4), [0, 10_000, 20_000, 30_000, 40_000, 50_000]);
});
