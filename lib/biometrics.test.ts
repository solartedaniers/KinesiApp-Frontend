// Ficha biométrica: lectura del formulario y validaciones espejo del backend. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { biometricsRules, readBiometrics } from "./biometrics.ts";
import type { ClientPolicy } from "./types.ts";
import { biometricsParams, birthDateBounds, isoDate, validateBirthDate, validateHeight, validateWeight } from "./validation.ts";

const TODAY = new Date(2026, 9, 3);
// Los mismos valores por defecto de AthleteSettings en el backend
const RULES = biometricsRules({
  athlete_min_age_years: 5,
  athlete_max_age_years: 100,
  min_height_cm: 80,
  max_height_cm: 250,
  min_weight_kg: 15,
  max_weight_kg: 250,
} as ClientPolicy);

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

test("una ficha válida produce el payload numérico, aceptando coma decimal", () => {
  const reading = readBiometrics(form({ gender: "female", birth_date: "2004-05-10", height_cm: "165", weight_kg: "58,5" }), TODAY, RULES);
  assert.equal(reading.errors, null);
  assert.deepEqual(reading.payload, { gender: "female", birth_date: "2004-05-10", height_cm: 165, weight_kg: 58.5 });
});

test("una ficha incompleta reporta cada campo y no arma payload", () => {
  const reading = readBiometrics(form({ gender: "robot", birth_date: "", height_cm: "abc", weight_kg: "500" }), TODAY, RULES);
  assert.equal(reading.payload, null);
  assert.deepEqual(reading.errors, {
    gender: "invalidOption",
    birth_date: "required",
    height_cm: "invalidNumber",
    weight_kg: "weightOutOfRange",
  });
  assert.equal(reading.values.height_cm, "abc");
});

test("la fecha de nacimiento es pasada y con edad en rango; los límites del input coinciden", () => {
  assert.equal(validateBirthDate("2026-10-03", TODAY, RULES), "birthDateInFuture");
  assert.equal(validateBirthDate("2023-01-01", TODAY, RULES), "ageOutOfRange");
  assert.equal(validateBirthDate("1900-01-01", TODAY, RULES), "ageOutOfRange");
  assert.equal(validateBirthDate("2000-02-30", TODAY, RULES), "invalidDate");
  const { min, max } = birthDateBounds(TODAY, RULES);
  assert.equal(validateBirthDate(min, TODAY, RULES), null);
  assert.equal(validateBirthDate(max, TODAY, RULES), null);
  assert.equal(isoDate(TODAY), "2026-10-03");
});

test("estatura en metros o peso en libras quedan fuera del rango; los bordes se aceptan", () => {
  assert.equal(validateHeight("", RULES), "required");
  assert.equal(validateHeight("1,75", RULES), "heightOutOfRange");
  assert.equal(validateHeight("80", RULES), null);
  assert.equal(validateHeight("250", RULES), null);
  assert.equal(validateHeight("250.1", RULES), "heightOutOfRange");
  assert.equal(validateWeight("14.9", RULES), "weightOutOfRange");
  assert.equal(validateWeight("15", RULES), null);
  assert.equal(validateWeight("300", RULES), "weightOutOfRange");
});

test("los mensajes interpolan el rango de la política, no constantes del cliente", () => {
  assert.deepEqual(biometricsParams(RULES).heightOutOfRange, { min: 80, max: 250 });
  assert.deepEqual(biometricsParams(RULES).weightOutOfRange, { min: 15, max: 250 });
  assert.deepEqual(biometricsParams(RULES).ageOutOfRange, { min: 5, max: 100 });
});
