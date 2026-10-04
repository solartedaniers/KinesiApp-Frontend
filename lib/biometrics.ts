// Lectura y validación de la ficha biométrica desde un formulario: lógica pura, compartida por el
// alta obligatoria del deportista, la edición de su perfil y los deportistas gestionados del coach.
import { formText } from "./form-state.ts";
import { GENDERS, type Gender } from "./types.ts";
import {
  collectErrors,
  parseMeasure,
  validateBirthDate,
  validateHeight,
  validateOption,
  validateWeight,
  type ValidationError,
} from "./validation.ts";

export type BiometricsField = "gender" | "birth_date" | "height_cm" | "weight_kg";

export type BiometricsPayload = { gender: Gender; birth_date: string; height_cm: number; weight_kg: number };

export type BiometricsReading = {
  /** Lo que escribió el usuario, para reponerlo si hay errores. */
  values: Record<BiometricsField, string>;
  errors: Partial<Record<BiometricsField, ValidationError>> | null;
  /** Sólo si no hay errores. */
  payload: BiometricsPayload | null;
};

export function readBiometrics(formData: FormData, today: Date): BiometricsReading {
  const values = {
    gender: formText(formData, "gender"),
    birth_date: formText(formData, "birth_date"),
    height_cm: formText(formData, "height_cm").trim(),
    weight_kg: formText(formData, "weight_kg").trim(),
  };
  const errors = collectErrors<BiometricsField>({
    gender: validateOption(values.gender, GENDERS),
    birth_date: validateBirthDate(values.birth_date, today),
    height_cm: validateHeight(values.height_cm),
    weight_kg: validateWeight(values.weight_kg),
  });
  const payload = errors
    ? null
    : {
        gender: values.gender as Gender,
        birth_date: values.birth_date,
        height_cm: parseMeasure(values.height_cm),
        weight_kg: parseMeasure(values.weight_kg),
      };
  return { values, errors, payload };
}
