// Tema claro, oscuro o del sistema. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { browserThemeColors, resolveTheme, THEME_COLOR, themeAttribute, themeBootScript } from "./theme.ts";

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

test("el script de arranque aplica solo light o dark desde la cookie", () => {
  const run = (cookie: string) => {
    const attributes: Record<string, string> = {};
    const document = { cookie, documentElement: { setAttribute: (name: string, value: string) => (attributes[name] = value) } };
    new Function("document", themeBootScript("kin_theme"))(document);
    return attributes["data-theme"];
  };
  assert.equal(run("a=1; kin_theme=dark"), "dark");
  assert.equal(run("kin_theme=light; b=2"), "light");
  assert.equal(run("kin_theme=system"), undefined);
  assert.equal(run("kin_theme=darkness"), undefined);
  assert.equal(run("xkin_theme=dark"), undefined);
});
