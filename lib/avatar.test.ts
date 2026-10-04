// Reglas de la foto de perfil y el escalado del Web Worker. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

// Módulo JavaScript servido tal cual desde public/ (allowJs): el mismo código que corre en el navegador
import { scaledSize } from "../public/workers/avatar-worker.js";
import { AVATAR_COMPRESSION, AVATAR_MAX_BYTES, canUploadOriginal, isImageFile } from "./avatar.ts";

const MAX = AVATAR_COMPRESSION.maxDimension;

test("el worker escala al lado mayor sin agrandar las fotos chicas", () => {
  assert.deepEqual(scaledSize(4000, 3000, MAX), { width: 512, height: 384 });
  assert.deepEqual(scaledSize(1080, 1920, MAX), { width: 288, height: 512 });
  assert.deepEqual(scaledSize(300, 200, MAX), { width: 300, height: 200 });
  assert.deepEqual(scaledSize(5000, 1, MAX), { width: 512, height: 1 });
});

test("sólo imágenes; sin worker, sólo la original si ya cumple tipo y peso", () => {
  assert.equal(isImageFile({ type: "image/heic" }), true);
  assert.equal(isImageFile({ type: "video/mp4" }), false);
  assert.equal(isImageFile(null), false);
  assert.equal(canUploadOriginal({ type: "image/png", size: AVATAR_MAX_BYTES }), true);
  assert.equal(canUploadOriginal({ type: "image/heic", size: 10 }), false);
  assert.equal(canUploadOriginal({ type: "image/jpeg", size: AVATAR_MAX_BYTES + 1 }), false);
});
