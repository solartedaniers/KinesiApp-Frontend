// Diccionarios es/en y elección del idioma. Correr con: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

import { format, resolveLocale } from "./i18n/locale.ts";

type Json = string | Json[] | { [key: string]: Json };

const load = (locale: string): Json => JSON.parse(readFileSync(new URL(`./i18n/${locale}.json`, import.meta.url), "utf8"));
const placeholders = (text: string) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

/** Recorre ambos diccionarios en paralelo y junta cada diferencia con su ruta (app.name, etc.). */
function compare(es: Json, en: Json, path: string, problems: string[]): void {
  if (typeof es === "string" || typeof en === "string") {
    if (typeof es !== typeof en) problems.push(`${path}: tipo distinto`);
    else if (!(en as string).trim()) problems.push(`${path}: vacío en en`);
    else if (placeholders(es as string).join() !== placeholders(en as string).join()) problems.push(`${path}: variables distintas`);
    return;
  }
  if (Array.isArray(es) !== Array.isArray(en)) {
    problems.push(`${path}: lista vs objeto`);
    return;
  }
  if (Array.isArray(es) && Array.isArray(en)) {
    if (es.length !== en.length) problems.push(`${path}: largo distinto`);
    es.forEach((item, index) => compare(item, en[index] ?? "", `${path}[${index}]`, problems));
    return;
  }
  const esObject = es as Record<string, Json>;
  const enObject = en as Record<string, Json>;
  for (const key of new Set([...Object.keys(esObject), ...Object.keys(enObject)])) {
    if (!(key in esObject)) problems.push(`${path}.${key}: sobra en en`);
    else if (!(key in enObject)) problems.push(`${path}.${key}: falta en en`);
    else compare(esObject[key], enObject[key], `${path}.${key}`, problems);
  }
}

test("es y en tienen las mismas claves y las mismas variables en cada texto", () => {
  const problems: string[] = [];
  compare(load("es"), load("en"), "", problems);
  assert.deepEqual(problems, []);
});

test("el idioma sale de la cookie y, si no hay, del navegador; si no, español", () => {
  assert.equal(resolveLocale("en", "es-CO,es;q=0.9"), "en");
  assert.equal(resolveLocale(undefined, "en-US,en;q=0.9,es;q=0.8"), "en");
  assert.equal(resolveLocale(undefined, "fr-FR,es;q=0.5,en;q=0.7"), "en");
  assert.equal(resolveLocale(undefined, "fr-FR,de;q=0.9"), "es");
  assert.equal(resolveLocale("xx", null), "es");
  assert.equal(resolveLocale(undefined, "en;q=0"), "es");
});

test("format reemplaza las variables y deja intactas las desconocidas", () => {
  assert.equal(format("Hola, {name}", { name: "Ana" }), "Hola, Ana");
  assert.equal(format("{a} y {b}", { a: 1 }), "1 y {b}");
});
