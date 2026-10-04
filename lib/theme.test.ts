// Tema claro, oscuro o del sistema. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { browserThemeColors, resolveTheme, THEME_COLOR, themeAttribute } from "./theme.ts";

test("el tema sale de la cookie y, si no es válido, sigue al sistema", () => {
  assert.equal(resolveTheme("dark"), "dark");
  assert.equal(resolveTheme("light"), "light");
  assert.equal(resolveTheme("purple"), "system");
  assert.equal(resolveTheme(undefined), "system");
});

test("sin data-theme el CSS sigue al sistema; con tema fijo, una sola barra del navegador", () => {
  assert.equal(themeAttribute("system"), undefined);
  assert.equal(themeAttribute("dark"), "dark");
  assert.deepEqual(browserThemeColors("light"), [{ color: THEME_COLOR.light }]);
  assert.equal(browserThemeColors("system").length, 2);
});
