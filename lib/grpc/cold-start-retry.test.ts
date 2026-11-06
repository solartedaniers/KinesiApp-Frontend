import assert from "node:assert/strict";
import test from "node:test";

import { Code, ConnectError, createContextValues, type Transport } from "@connectrpc/connect";

import { SKIP_COLD_START_RETRY, withColdStartRetry } from "./cold-start-retry.ts";
import { rpcReason } from "./errors.ts";

// El 503 del borde de Render no trae grpc-status; un UNAVAILABLE del backend sí
const renderAsleep = () => new ConnectError("HTTP 503", Code.Unavailable, new Headers({ "content-type": "text/html" }));
const backendUnavailable = () => new ConnectError("ai down", Code.Unavailable, new Headers({ "grpc-status": "14" }));

function fakeTransport(outcomes: (Error | "ok")[]) {
  const calls = { unary: 0, stream: 0 };
  const transport = {
    async unary() {
      const outcome = outcomes[calls.unary++];
      if (outcome !== "ok") throw outcome;
      return "response";
    },
    async stream() {
      calls.stream++;
      throw renderAsleep();
    },
  } as unknown as Transport;
  return { transport, calls };
}

// Reloj de mentira: dormir solo avanza el tiempo, así la prueba no espera de verdad
function fakeClock() {
  let time = 0;
  const waits: number[] = [];
  return {
    waits,
    now: () => time,
    sleep: async (ms: number) => {
      waits.push(ms);
      time += ms;
    },
  };
}

const unary = (transport: Transport, contextValues = createContextValues()) =>
  transport.unary({} as never, undefined, undefined, undefined, {} as never, contextValues);

test("reintenta el 503 de Render con espera creciente hasta que responde", async () => {
  const { transport, calls } = fakeTransport([renderAsleep(), renderAsleep(), renderAsleep(), "ok"]);
  const clock = fakeClock();
  const retrying = withColdStartRetry(transport, { firstDelayMs: 1000, maxDelayMs: 3000, maxWaitMs: 90_000, ...clock });
  assert.equal(await unary(retrying), "response");
  assert.equal(calls.unary, 4);
  assert.deepEqual(clock.waits, [1000, 2000, 3000]);
});

test("no reintenta un UNAVAILABLE que sí viene del backend", async () => {
  const { transport, calls } = fakeTransport([backendUnavailable(), "ok"]);
  const retrying = withColdStartRetry(transport, { firstDelayMs: 1000, maxDelayMs: 3000, maxWaitMs: 90_000, ...fakeClock() });
  await assert.rejects(unary(retrying), (error: ConnectError) => error.rawMessage === "ai down");
  assert.equal(calls.unary, 1);
});

test("se rinde al pasar el tope y el error se muestra como servidor dormido", async () => {
  const { transport, calls } = fakeTransport(Array.from({ length: 20 }, renderAsleep));
  const clock = fakeClock();
  const retrying = withColdStartRetry(transport, { firstDelayMs: 1000, maxDelayMs: 4000, maxWaitMs: 10_000, ...clock });
  await assert.rejects(unary(retrying), (error) => rpcReason(error) === "SERVER_ASLEEP");
  // 1 + 2 + 4 = 7 s; la siguiente espera de 4 s pasaría los 10 s
  assert.deepEqual(clock.waits, [1000, 2000, 4000]);
  assert.equal(calls.unary, 4);
});

test("el ping de despertar y los streams no se reintentan", async () => {
  const { transport, calls } = fakeTransport([renderAsleep(), "ok"]);
  const retrying = withColdStartRetry(transport, { firstDelayMs: 1000, maxDelayMs: 3000, maxWaitMs: 90_000, ...fakeClock() });
  await assert.rejects(unary(retrying, createContextValues().set(SKIP_COLD_START_RETRY, true)));
  assert.equal(calls.unary, 1);
  await assert.rejects(retrying.stream({} as never, undefined, undefined, undefined, (async function* () {})()));
  assert.equal(calls.stream, 1);
});

test("el UNAVAILABLE del backend sigue siendo NETWORK y el 503 de Render es SERVER_ASLEEP", () => {
  assert.equal(rpcReason(backendUnavailable()), "NETWORK");
  assert.equal(rpcReason(renderAsleep()), "SERVER_ASLEEP");
});
