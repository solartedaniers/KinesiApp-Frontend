// Ficha biométrica: lectura del formulario y validaciones espejo del backend. Correr con: npm test
import assert from "node:assert/strict";
import { test } from "node:test";

import { readBiometrics } from "./biometrics.ts";
import { birthDateBounds, isoDate, validateBirthDate, validateHeight, validateWeight } from "./validation.ts";

const TODAY = new Date(2026, 9, 3);

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [name, value] of Object.entries(fields)) data.set(name, value);
  return data;
}

test("una ficha válida produce el payload numérico, aceptando coma decimal", () => {
  const reading = readBiometrics(form({ gender: "female", birth_date: "2004-05-10", height_cm: "165", weight_kg: "58,5" }), TODAY);
  assert.equal(reading.errors, null);
  assert.deepEqual(reading.payload, { gender: "female", birth_date: "2004-05-10", height_cm: 165, weight_kg: 58.5 });
});

test("una ficha incompleta reporta cada campo y no arma payload", () => {
  const reading = readBiometrics(form({ gender: "robot", birth_date: "", height_cm: "abc", weight_kg: "500" }), TODAY);
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
  assert.equal(validateBirthDate("2026-10-03", TODAY), "birthDateInFuture");
  assert.equal(validateBirthDate("2023-01-01", TODAY), "ageOutOfRange");
  assert.equal(validateBirthDate("1900-01-01", TODAY), "ageOutOfRange");
  assert.equal(validateBirthDate("2000-02-30", TODAY), "invalidDate");
  const { min, max } = birthDateBounds(TODAY);
  assert.equal(validateBirthDate(min, TODAY), null);
  assert.equal(validateBirthDate(max, TODAY), null);
  assert.equal(isoDate(TODAY), "2026-10-03");
});

test("estatura y peso positivos y acotados", () => {
  assert.equal(validateHeight(""), "required");
  assert.equal(validateHeight("0"), "heightOutOfRange");
  assert.equal(validateHeight("172.5"), null);
  assert.equal(validateWeight("401"), "weightOutOfRange");
});
