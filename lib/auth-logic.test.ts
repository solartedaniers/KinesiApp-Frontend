// Lógica pura de autenticación. Correr con: npm test (node:test, sin dependencias)
import assert from "node:assert/strict";
import { test } from "node:test";

import { readTokenExpiry, secondsUntilExpiry, shouldRefresh } from "./jwt.ts";
import { isAuthRoute, isPrivateRoute, safeNextPath } from "./routes.ts";
import {
  collectErrors,
  validateEmail,
  normalizeFullName,
  passwordRequirementStatus,
  validateFullName,
  validateNewPassword,
  validateOtp,
  validatePasswordConfirmation,
} from "./validation.ts";

function fakeJwt(payload: object): string {
  return `header.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.signature`;
}

test("la contraseña nueva sigue la política del backend", () => {
  assert.equal(validateNewPassword(""), "required");
  assert.equal(validateNewPassword("Ab1!"), "passwordTooShort");
  assert.equal(validateNewPassword("Aa1!".repeat(33)), "passwordTooLong");
  assert.equal(validateNewPassword("solamente1!"), "passwordNoUppercase");
  assert.equal(validateNewPassword("SOLAMENTE1!"), "passwordNoLowercase");
  assert.equal(validateNewPassword("SinNumeros!"), "passwordNoDigit");
  assert.equal(validateNewPassword("Sin especial 1"), "passwordNoSpecial");
  assert.equal(validateNewPassword("Ñandú2024!"), null);
  assert.deepEqual(passwordRequirementStatus("abc"), {
    minLength: false,
    uppercase: false,
    lowercase: true,
    digit: false,
    special: false,
  });
});

test("el nombre completo sólo admite letras y espacios", () => {
  assert.equal(validateFullName("  "), "required");
  assert.equal(validateFullName("María José Ñúñez Güell"), null);
  assert.equal(validateFullName("Mari\u0301a"), null); // tilde combinable, como la mandan algunos teclados
  for (const invalid of ["Ana3", "Ana_Pérez", "R2-D2", "Ana!", "Luis ²"]) {
    assert.equal(validateFullName(invalid), "fullNameInvalid", invalid);
  }
  assert.equal(normalizeFullName("  Ana   María "), "Ana María");
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
  for (const path of ["/home", "/athlete", "/admin/users", "/analyses/7", "/ruta-nueva"]) {
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
