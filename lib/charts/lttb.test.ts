// Reducción de series para las gráficas. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { lttb } from "./lttb.ts";

const wave = Array.from({ length: 1300 }, (_, x) => ({ x, y: Math.sin(x / 40) * 50 + (x === 700 ? 400 : 0) }));

test("deja el número pedido de puntos y conserva los extremos de la serie", () => {
  const out = lttb(wave, 200);
  assert.equal(out.length, 200);
  assert.equal(out[0], wave[0]);
  assert.equal(out.at(-1), wave.at(-1));
});

test("no pierde un pico aislado", () => {
  assert.ok(lttb(wave, 120).some((point) => point.y > 300));
});

test("mantiene el orden temporal", () => {
  const xs = lttb(wave, 150).map((point) => point.x);
  assert.deepEqual(xs, [...xs].sort((a, b) => a - b));
});

test("una serie más corta que el umbral vuelve igual", () => {
  assert.deepEqual(lttb(wave.slice(0, 10), 50), wave.slice(0, 10));
});
