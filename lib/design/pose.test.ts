// Cinemática del esqueleto de las ilustraciones. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { centerOfMass, frameBounds, interiorAngle, JUMP_PHASES, SEGMENTS, sequence, smoothPath, solvePose, SQUAT_PHASES } from "./pose.ts";

const STANDING = { shank: 0, knee: 0, hip: 0, shoulder: 0, elbow: 0 };
const close = (a: number, b: number, tolerance = 0.01) => assert.ok(Math.abs(a - b) < tolerance, `${a} ≉ ${b}`);

test("de pie, cadera y cabeza quedan sobre el tobillo a la altura de sus segmentos", () => {
  const k = solvePose(STANDING);
  close(k.hip.x, 0);
  close(k.hip.y, -(SEGMENTS.shank + SEGMENTS.thigh));
  close(k.head.y, -(SEGMENTS.shank + SEGMENTS.thigh + SEGMENTS.trunk + SEGMENTS.neck + SEGMENTS.head));
});

test("la flexión de rodilla se lee de vuelta como 180 menos el ángulo interior", () => {
  for (const knee of [0, 45, 90, 115]) {
    const k = solvePose({ ...STANDING, shank: 20, knee, hip: knee });
    close(180 - interiorAngle(k.hip, k.knee, k.ankle), knee);
  }
});

test("de pie, el centro de gravedad cae sobre la base de apoyo, cerca del 55 % de la estatura", () => {
  const k = solvePose(STANDING);
  const center = centerOfMass(k);
  assert.ok(center.x > k.heel.x && center.x < k.toe.x);
  assert.ok(-center.y > 50 && -center.y < 62, String(center.y));
});

test("en la sentadilla el centro de gravedad baja y en el vuelo del salto sube", () => {
  const squat = sequence(SQUAT_PHASES, 0, 0).map(({ center }) => center.y);
  assert.equal(Math.max(...squat), squat[3]);
  const jump = sequence(JUMP_PHASES, 0, 0).map(({ center }) => center.y);
  assert.equal(Math.min(...jump), jump[5]);
});

test("la curva suave empieza y termina en los puntos dados", () => {
  const d = smoothPath([{ x: 0, y: 0 }, { x: 10, y: 5 }, { x: 20, y: 0 }]);
  assert.match(d, /^M0 0 C/);
  assert.match(d, / 20 0$/);
  assert.equal(smoothPath([]), "");
});

test("la caja de las poses las contiene con su margen y deja el suelo adentro", () => {
  const frames = sequence(JUMP_PHASES, 30, 0).map(({ keypoints }) => keypoints);
  const box = frameBounds(frames, 5);
  for (const p of frames.flatMap((k) => Object.values(k))) {
    assert.ok(p.x >= box.x + 5 - 1e-9 && p.x <= box.x + box.width - 5 + 1e-9);
    assert.ok(p.y >= box.y + 5 - 1e-9);
  }
  assert.ok(box.y + box.height >= 5);
});
