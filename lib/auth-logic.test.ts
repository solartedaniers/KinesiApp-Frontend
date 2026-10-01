// Lógica pura de autenticación. Correr con: npm test (node:test, sin dependencias)
import assert from "node:assert/strict";
import { test } from "node:test";

import { readTokenExpiry, secondsUntilExpiry, shouldRefresh } from "./jwt.ts";
import { isAuthRoute, isPrivateRoute, safeNextPath } from "./routes.ts";
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

test("renueva sin access o cuando le queda menos que el margen", () => {
  const now = 1_700_000_000_000;
  assert.equal(shouldRefresh(undefined, 60, now), true);
  assert.equal(shouldRefresh(fakeJwt({ exp: now / 1000 + 59 }), 60, now), true);
  assert.equal(shouldRefresh(fakeJwt({ exp: now / 1000 + 600 }), 60, now), false);
  assert.equal(shouldRefresh("basura", 60, now), true);
});

test("rutas privadas por defecto, de acceso y públicas", () => {
  for (const path of ["/home", "/athlete", "/admin/users", "/analysis/7", "/ruta-nueva"]) {
    assert.equal(isPrivateRoute(path), true, path);
  }
  for (const path of ["/login", "/register", "/verify-email", "/password-recovery"]) {
    assert.equal(isAuthRoute(path), true, path);
    assert.equal(isPrivateRoute(path), false, path);
  }
  for (const path of ["/", "/legal/video-consent", "/manifest.webmanifest", "/api/session/logout", "/api/session/expired"]) {
    assert.equal(isPrivateRoute(path), false, path);
  }
  assert.equal(isAuthRoute("/loginx"), false);
});

test("el proxy de lecturas sólo deja pasar la lista blanca", async () => {
  const { isAllowedProxyRead } = await import("./proxy-allowlist.ts");
  assert.equal(isAllowedProxyRead("jump-analyses/12"), true);
  assert.equal(isAllowedProxyRead("jump-analyses/12/video-access"), true);
  for (const path of ["jump-analyses/12/video", "users", "auth/me", "jump-analyses/team", "jump-analyses/1/../../users"]) {
    assert.equal(isAllowedProxyRead(path), false, path);
  }
});
