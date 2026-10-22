// Mensajes entre la app y sus workers, en los dos sentidos. Correr con: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { runInNewContext } from "node:vm";

// Módulos JavaScript servidos tal cual desde public/ (allowJs): el mismo código que corre en el navegador
import { isCompressRequest } from "../public/workers/avatar-worker.js";
import { isVideoFile } from "../public/workers/video-metadata-worker.js";
import { AVATAR_COMPRESSION } from "./avatar.ts";
import { avatarReplySchema, broadcastSchema, fromCoordinatorSchema, reportReplySchema, videoReadingSchema } from "./worker-messages.ts";

test("la lectura del video acepta la forma del worker o null, y descarta lo demás", () => {
  assert.ok(videoReadingSchema.safeParse({ durationMs: 1500, width: 64, height: 48, container: "mp4" }).success);
  assert.ok(videoReadingSchema.safeParse({ durationMs: null, width: 64, height: 48, container: "webm" }).success);
  assert.ok(videoReadingSchema.safeParse(null).success);
  assert.ok(!videoReadingSchema.safeParse({ durationMs: "40000", width: 64, height: 48, container: "mp4" }).success);
  assert.ok(!videoReadingSchema.safeParse({ durationMs: Number.NaN, width: 64, height: 48, container: "mp4" }).success);
  assert.ok(!videoReadingSchema.safeParse(undefined).success);
});

test("la respuesta del avatar exige el Blob cuando dice que salió bien", () => {
  assert.ok(avatarReplySchema.safeParse({ ok: true, blob: new Blob(["x"]) }).success);
  assert.ok(avatarReplySchema.safeParse({ ok: false, tooLarge: true }).success);
  assert.ok(!avatarReplySchema.safeParse({ ok: true }).success);
  assert.ok(!avatarReplySchema.safeParse({ ok: true, blob: "data:image/jpeg;base64," }).success);
});

test("el informe solo acepta bytes o null", () => {
  assert.ok(reportReplySchema.safeParse(new Uint8Array([37, 80, 68, 70])).success);
  assert.ok(reportReplySchema.safeParse(null).success);
  assert.ok(!reportReplySchema.safeParse([37, 80, 68, 70]).success);
});

test("los mensajes del estado de la IA entre pestañas se descartan si no siguen el protocolo", () => {
  const state = { status: "ready", at: 1, version: 2 };
  assert.ok(fromCoordinatorSchema.safeParse({ type: "state", state }).success);
  assert.ok(fromCoordinatorSchema.safeParse({ type: "perform" }).success);
  assert.ok(!fromCoordinatorSchema.safeParse({ type: "state", state: { ...state, status: "asleep" } }).success);
  assert.ok(!fromCoordinatorSchema.safeParse({ type: "state", state: { ...state, version: 1.5 } }).success);
  assert.ok(broadcastSchema.safeParse({ type: "query" }).success);
  assert.ok(!broadcastSchema.safeParse({ type: "state" }).success);
  assert.ok(!broadcastSchema.safeParse("query").success);
});

test("el worker de metadatos solo acepta un archivo", () => {
  assert.equal(isVideoFile(new Blob(["x"])), true);
  assert.equal(isVideoFile("video.mp4"), false);
  assert.equal(isVideoFile(null), false);
});

test("el worker del avatar descarta pedidos sin foto o con una configuración inválida", () => {
  const file = new Blob(["x"]);
  assert.equal(isCompressRequest({ file, config: AVATAR_COMPRESSION }), true);
  assert.equal(isCompressRequest({ file: "foto.jpg", config: AVATAR_COMPRESSION }), false);
  assert.equal(isCompressRequest({ file, config: { ...AVATAR_COMPRESSION, qualities: [] } }), false);
  assert.equal(isCompressRequest({ file, config: { ...AVATAR_COMPRESSION, qualities: [1.5] } }), false);
  assert.equal(isCompressRequest({ file, config: { ...AVATAR_COMPRESSION, outputType: "text/html" } }), false);
  assert.equal(isCompressRequest({ file }), false);
});

type Port = { onmessage: ((event: { data: unknown }) => void) | null; sent: unknown[]; postMessage(message: unknown): void; start(): void };

// El Shared Worker es un script clásico, sin export: lo corro en un contexto aislado con un `self` falso
function connectToAiStatusWorker(): Port {
  const self: { onconnect?: (event: { ports: Port[] }) => void } = {};
  runInNewContext(readFileSync("public/workers/ai-status-worker.js", "utf8"), { self, Date });
  const port: Port = { onmessage: null, sent: [], postMessage(message) { this.sent.push(message); }, start() {} };
  self.onconnect!({ ports: [port] });
  return port;
}

test("el Shared Worker descarta mensajes fuera del protocolo sin tocar el estado", () => {
  const port = connectToAiStatusWorker();
  port.sent.length = 0;
  for (const data of [null, "claim", { type: "claim" }, { type: "claim", version: -1 }, { type: "result", status: "asleep" }, { type: "hack" }]) {
    port.onmessage!({ data });
  }
  assert.deepEqual(port.sent, []);

  port.onmessage!({ data: { type: "claim", version: 0 } });
  assert.deepEqual(JSON.parse(JSON.stringify(port.sent.at(-1))), { type: "perform" });
});
