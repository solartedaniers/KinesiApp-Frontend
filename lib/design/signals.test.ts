// Zonas del rango de flexión. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { zoneOf, zoneSpans } from "./signals.ts";

test("cada valor cae en su zona y los bordes del objetivo cuentan como dentro", () => {
  assert.equal(zoneOf(60), "under");
  assert.equal(zoneOf(90), "target");
  assert.equal(zoneOf(120), "target");
  assert.equal(zoneOf(121), "over");
});

test("los tramos cubren la escala completa sin huecos y descartan los vacíos", () => {
  assert.deepEqual(zoneSpans(150), [
    { zone: "under", from: 0, to: 90 },
    { zone: "target", from: 90, to: 120 },
    { zone: "over", from: 120, to: 150 },
  ]);
  assert.deepEqual(zoneSpans(100).map((s) => s.zone), ["under", "target"]);
});
