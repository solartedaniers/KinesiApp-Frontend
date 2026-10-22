// Configuración pública por variables de entorno. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { parsePublicConfig } from "./config.ts";

test("sin variables usa los valores documentados en .env.example", () => {
  const config = parsePublicConfig({});
  assert.equal(config.NEXT_PUBLIC_APP_TIME_ZONE, "America/Bogota");
  assert.equal(config.NEXT_PUBLIC_OTP_RESEND_COOLDOWN_SECONDS, 30);
  assert.equal(config.NEXT_PUBLIC_AI_WARMING_ATTEMPTS, 20);
});

test("convierte los números que llegan como texto", () => {
  assert.equal(parsePublicConfig({ NEXT_PUBLIC_AI_READY_TTL_MS: "120000" }).NEXT_PUBLIC_AI_READY_TTL_MS, 120_000);
});

test("una zona horaria o un número inválidos fallan al arrancar en vez de usarse", () => {
  assert.throws(() => parsePublicConfig({ NEXT_PUBLIC_APP_TIME_ZONE: "Marte/Olympus" }));
  assert.throws(() => parsePublicConfig({ NEXT_PUBLIC_VIDEO_URL_RENEW_MARGIN_MS: "-5" }));
  assert.throws(() => parsePublicConfig({ NEXT_PUBLIC_AI_WARMING_ATTEMPTS: "muchos" }));
});
