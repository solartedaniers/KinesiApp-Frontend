// Lector de metadatos del worker con videos reales chicos (1,5 s a 64×48). Correr con: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// Módulo JavaScript servido tal cual desde public/ (allowJs): el mismo código que corre en el navegador
import { readVideoMetadata } from "../public/workers/video-metadata-worker.js";

const fixture = (name: string) => new Blob([readFileSync(new URL(`./__fixtures__/${name}`, import.meta.url))]);

for (const [name, container] of [["clip.mp4", "mp4"], ["clip.mov", "mov"], ["clip.webm", "webm"]] as const) {
  test(`lee duración, resolución y contenedor de ${name}`, async () => {
    assert.deepEqual(await readVideoMetadata(fixture(name)), { durationMs: 1500, width: 64, height: 48, container });
  });
}

test("lo que no es video devuelve null para que la página use <video>", async () => {
  assert.equal(await readVideoMetadata(new Blob([new Uint8Array(64)])), null);
});
