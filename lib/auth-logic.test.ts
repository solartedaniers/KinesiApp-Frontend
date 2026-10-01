// Lógica pura de autenticación. Correr con: npm test (node:test, sin dependencias)
import assert from "node:assert/strict";
import { test } from "node:test";

import { readTokenExpiry, secondsUntilExpiry } from "./jwt.ts";
import { safeNextPath } from "./routes.ts";
import {
  collectErrors,
  validateEmail,
  validateNewPassword,
  validateOtp,
  validatePasswordConfirmation,
} from "./validation.ts";

function fakeJwt(payload: object): string {
  return `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;
}

test("la contraseña nueva sigue la política del backend", () => {
  assert.equal(validateNewPassword(""), "required");
  assert.equal(validateNewPassword("abc1"), "passwordTooShort");
  assert.equal(validateNewPassword("a1".repeat(65)), "passwordTooLong");
  assert.equal(validateNewPassword("solamenteletras"), "passwordWeak");
  assert.equal(validateNewPassword("12345678"), "passwordWeak");
  assert.equal(validateNewPassword("ñandú2024"), null);
});

test("correo, confirmación y OTP", () => {
  assert.equal(validateEmail("ana@kinesi.app"), null);
  assert.equal(validateEmail("ana@kinesi"), "invalidEmail");
  assert.equal(validatePasswordConfirmation("abc12345", "abc12346"), "passwordMismatch");
  assert.equal(validateOtp("12345"), "invalidOtp");
  assert.equal(validateOtp("123456"), null);
  assert.deepEqual(collectErrors({ a: null, b: "required" }), { b: "required" });
  assert.equal(collectErrors({ a: null }), null);
});

test("next sólo acepta rutas internas", () => {
  assert.equal(safeNextPath("/athlete/stats"), "/athlete/stats");
  assert.equal(safeNextPath("//evil.com"), null);
  assert.equal(safeNextPath("/\\evil.com"), null);
  assert.equal(safeNextPath("https://evil.com"), null);
  assert.equal(safeNextPath(""), null);
});

test("lee exp del JWT sin verificar firma", () => {
  const now = 1_700_000_000_000;
  const token = fakeJwt({ sub: "1", exp: now / 1000 + 90 });
  assert.equal(readTokenExpiry(token), now / 1000 + 90);
  assert.equal(secondsUntilExpiry(token, now), 90);
  assert.equal(secondsUntilExpiry(fakeJwt({ exp: now / 1000 - 5 }), now), 0);
  assert.equal(readTokenExpiry("no-es-un-jwt"), null);
});
