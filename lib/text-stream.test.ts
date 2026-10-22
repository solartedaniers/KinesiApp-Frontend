import assert from "node:assert/strict";
import { test } from "node:test";

import { createTextBatcher } from "./text-stream.ts";

test("los fragmentos de una misma task salen en un solo flush, en orden", async () => {
  const flushes: string[] = [];
  const batcher = createTextBatcher((text) => flushes.push(text));
  batcher.push("Hola");
  batcher.push(", ");
  batcher.push("mundo");
  assert.deepEqual(flushes, []);
  await Promise.resolve();
  assert.deepEqual(flushes, ["Hola, mundo"]);
  batcher.push("!");
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(flushes, ["Hola, mundo", "!"]);
});
