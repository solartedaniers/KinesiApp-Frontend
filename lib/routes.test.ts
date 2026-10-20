// Qué rutas exigen sesión. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { isPrivateRoute, ROUTES } from "./routes.ts";

test("la guía de estilo y sus pantallas de ejemplo se ven sin cuenta", () => {
  assert.equal(isPrivateRoute(ROUTES.styleGuide), false);
  assert.equal(isPrivateRoute(ROUTES.styleGuideScreen("capture")), false);
});

test("lo que no está declarado como público exige sesión", () => {
  assert.equal(isPrivateRoute(ROUTES.home), true);
  assert.equal(isPrivateRoute("/style-guidex"), true);
});
