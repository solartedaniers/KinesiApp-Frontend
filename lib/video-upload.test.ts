// Validación del video antes de subirlo y del mensaje del chat. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { validateChatMessage } from "./validation.ts";
import { bytesToMegabytes, validateVideoFile } from "./video-upload.ts";

const MAX = 100 * 1024 * 1024;

test("el video debe existir, ser de tipo video y no superar el límite del backend", () => {
  assert.equal(validateVideoFile(null, MAX), "videoRequired");
  assert.equal(validateVideoFile({ type: "video/mp4", size: 0 }, MAX), "videoRequired");
  assert.equal(validateVideoFile({ type: "image/png", size: 10 }, MAX), "videoInvalidType");
  assert.equal(validateVideoFile({ type: "video/webm", size: MAX + 1 }, MAX), "videoTooLarge");
  assert.equal(validateVideoFile({ type: "video/quicktime", size: MAX }, MAX), null);
  assert.equal(bytesToMegabytes(MAX), 100);
});

test("el mensaje del chat no puede estar vacío ni superar el máximo", () => {
  assert.equal(validateChatMessage("   "), "required");
  assert.equal(validateChatMessage("¿Qué significa mi riesgo?"), null);
  assert.equal(validateChatMessage("a".repeat(1001)), "chatMessageTooLong");
});
