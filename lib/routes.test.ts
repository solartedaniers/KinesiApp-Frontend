// Qué rutas exigen sesión. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { isPrivateRoute, parseId, ROUTES } from "./routes.ts";

test("la guía de estilo y sus pantallas de ejemplo se ven sin cuenta", () => {
  assert.equal(isPrivateRoute(ROUTES.styleGuide), false);
  assert.equal(isPrivateRoute(ROUTES.styleGuideScreen("capture")), false);
});

test("lo que no está declarado como público exige sesión", () => {
  assert.equal(isPrivateRoute(ROUTES.home), true);
  assert.equal(isPrivateRoute("/style-guidex"), true);
});

test("parseId acepta solo enteros positivos", () => {
  assert.equal(parseId("12"), "12");
  assert.equal(parseId(["7", "8"]), "7");
  for (const bad of ["0", "-1", "1.5", "abc", "", undefined, "01"]) assert.equal(parseId(bad), null, String(bad));
});
