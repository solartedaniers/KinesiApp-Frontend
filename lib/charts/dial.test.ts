// Geometría de la esfera de los medidores. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { dialAngle, dialArc, dialPoint } from "./dial.ts";

const center = { x: 100, y: 100 };
const near = (p: { x: number; y: number }, x: number, y: number) => Math.abs(p.x - x) < 1e-9 && Math.abs(p.y - y) < 1e-9;

test("con media vuelta la esfera va de izquierda a derecha por arriba y recorta lo que se sale", () => {
  assert.ok(near(dialPoint(center, 50, 0, 150, 180), 50, 100));
  assert.ok(near(dialPoint(center, 50, 75, 150, 180), 100, 50));
  assert.ok(near(dialPoint(center, 50, 200, 150, 180), 150, 100));
});

test("el tacómetro de 240° centra la mitad arriba y abre el arco largo cuando pasa de 180°", () => {
  assert.equal(dialAngle(0, 150), -120);
  assert.equal(dialAngle(75, 150), 0);
  assert.equal(dialAngle(150, 150), 120);
  assert.match(dialArc(center, 50, 0, 150, 150), / 0 1 1 /);
  assert.match(dialArc(center, 50, 0, 30, 150), / 0 0 1 /);
});
