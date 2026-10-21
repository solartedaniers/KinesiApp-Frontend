// Cuenta de demostración del login. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { readDemoLogin } from "./demo-login.ts";

test("con las dos variables devuelve la cuenta para prellenar el login", () => {
  assert.deepEqual(readDemoLogin({ DEMO_LOGIN_EMAIL: "demo@example.com", DEMO_LOGIN_PASSWORD: "Secreta1!" }), {
    email: "demo@example.com",
    password: "Secreta1!",
  });
});

test("sin variables, con una sola o vacías el login sale vacío", () => {
  assert.equal(readDemoLogin({}), null);
  assert.equal(readDemoLogin({ DEMO_LOGIN_EMAIL: "demo@example.com" }), null);
  assert.equal(readDemoLogin({ DEMO_LOGIN_PASSWORD: "Secreta1!" }), null);
  assert.equal(readDemoLogin({ DEMO_LOGIN_EMAIL: "", DEMO_LOGIN_PASSWORD: "" }), null);
});

test("un correo mal escrito falla al cargar la página en vez de prellenar algo inválido", () => {
  assert.throws(() => readDemoLogin({ DEMO_LOGIN_EMAIL: "no-es-correo", DEMO_LOGIN_PASSWORD: "Secreta1!" }));
});
