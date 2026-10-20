// Geometría de la esfera de los medidores. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { dialArc, dialPoint } from "./dial.ts";

const center = { x: 100, y: 100 };
const near = (p: { x: number; y: number }, x: number, y: number) => Math.abs(p.x - x) < 1e-9 && Math.abs(p.y - y) < 1e-9;

test("la esfera va de izquierda a derecha por arriba y recorta lo que se sale", () => {
  assert.ok(near(dialPoint(center, 50, 0, 150), 50, 100));
  assert.ok(near(dialPoint(center, 50, 75, 150), 100, 50));
  assert.ok(near(dialPoint(center, 50, 150, 150), 150, 100));
  assert.ok(near(dialPoint(center, 50, 200, 150), 150, 100));
});

test("el arco empieza y termina en los valores pedidos", () => {
  assert.equal(dialArc(center, 50, 0, 150, 150), "M50 100A50 50 0 0 1 150 100");
});
