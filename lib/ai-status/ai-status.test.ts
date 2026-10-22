// Estado compartido de la IA y reintentos de WakeUpAi. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { isFresh, visibleStatus, visibleUntil } from "./protocol.ts";
import { wakeUntilReady } from "./wake.ts";

const timings = { readyTtlMs: 1000, wakeStaleMs: 500 };

test("un estado activo o encendiendo vale hasta su vencimiento", () => {
  assert.equal(isFresh({ status: "ready", at: 0, version: 1 }, timings, 999), true);
  assert.equal(isFresh({ status: "ready", at: 0, version: 1 }, timings, 1000), false);
  assert.equal(isFresh({ status: "waking", at: 0, version: 1 }, timings, 499), true);
  assert.equal(isFresh({ status: "waking", at: 0, version: 1 }, timings, 500), false);
  assert.equal(isFresh({ status: "unavailable", at: 0, version: 1 }, timings, 1), false);
  assert.equal(isFresh({ status: "idle", at: 0, version: 0 }, timings, 1), false);
});

test("cada aviso se muestra mientras dura su vigencia", () => {
  assert.equal(visibleStatus({ status: "ready", at: 0, version: 1 }, timings, 999), "ready");
  assert.equal(visibleStatus({ status: "ready", at: 0, version: 1 }, timings, 2000), "idle");
  assert.equal(visibleStatus({ status: "unavailable", at: 0, version: 1 }, timings, 10), "unavailable");
  assert.equal(visibleStatus({ status: "waking", at: 0, version: 1 }, timings, 600), "idle");
  assert.equal(visibleUntil({ status: "waking", at: 100, version: 1 }, timings), 600);
  assert.equal(visibleUntil({ status: "idle", at: 0, version: 0 }, timings), null);
});

test("reintenta mientras la IA sigue cargando y se detiene al quedar lista", async () => {
  const outcomes = ["warming_up", "warming_up", "ready"] as const;
  let calls = 0;
  const waits: number[] = [];
  const status = await wakeUntilReady(async () => outcomes[calls++], { retryMs: 7, attempts: 5, sleep: async (ms) => void waits.push(ms) });
  assert.equal(status, "ready");
  assert.equal(calls, 3);
  assert.deepEqual(waits, [7, 7]);
});

test("sin respuesta lista dentro del tope, la doy por no disponible", async () => {
  let calls = 0;
  const status = await wakeUntilReady(async () => (calls++, "warming_up"), { retryMs: 1, attempts: 3, sleep: async () => {} });
  assert.equal(status, "unavailable");
  assert.equal(calls, 3);
  assert.equal(await wakeUntilReady(async () => "unavailable", { retryMs: 1, attempts: 3 }), "unavailable");
});
