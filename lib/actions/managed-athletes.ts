"use server";

import { redirect } from "next/navigation";

import { API_PATHS } from "../api-paths";
import { type BiometricsField, readBiometrics } from "../biometrics";
import { errorMessage, validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { todayInAppTimeZone } from "../format";
import type { Dictionary } from "../i18n";
import { getT } from "../i18n/server";
import { coachAthletePath, ROUTES } from "../routes";
import type { AthleteProfile } from "../types";
import { normalizeFullName, validateFullName } from "../validation";
import { authedMutation } from "./request";

export type ManagedAthleteField = "full_name" | BiometricsField;

type Reading = { values: Partial<Record<ManagedAthleteField, string>>; state?: FormState<ManagedAthleteField>; body?: object };

/** Nombre + ficha biométrica: el coach los captura porque el deportista gestionado no inicia sesión. */
function readManagedAthlete(t: Dictionary, formData: FormData): Reading {
  const fullName = normalizeFullName(formText(formData, "full_name"));
  const biometrics = readBiometrics(formData, todayInAppTimeZone());
  const values = { ...biometrics.values, full_name: fullName };
  const nameError = validateFullName(fullName);
  const errors = { ...(biometrics.errors ?? {}), ...(nameError ? { full_name: nameError } : {}) };
  if (!biometrics.payload || nameError) return { values, state: { fieldErrors: validationMessages(t, errors), values } };
  return { values, body: { ...biometrics.payload, full_name: fullName } };
}

export async function createManagedAthlete(
  _previous: FormState<ManagedAthleteField>,
  formData: FormData,
): Promise<FormState<ManagedAthleteField>> {
  const t = await getT();
  const { values, state, body } = readManagedAthlete(t, formData);
  if (state) return state;

  let athlete: AthleteProfile;
  try {
    athlete = await authedMutation<AthleteProfile>(API_PATHS.coachAthletes, { method: "POST", body });
  } catch (error) {
    return { error: errorMessage(t, error), values };
  }
  redirect(coachAthletePath(athlete.id));
}

/** Ligada al deportista con `.bind(null, athleteId)` desde la página de edición. */
export async function updateManagedAthlete(
  athleteId: number,
  _previous: FormState<ManagedAthleteField>,
  formData: FormData,
): Promise<FormState<ManagedAthleteField>> {
  const t = await getT();
  const { values, state, body } = readManagedAthlete(t, formData);
  if (state) return state;

  try {
    await authedMutation(API_PATHS.coachAthlete(athleteId), { method: "PATCH", body });
  } catch (error) {
    return { error: errorMessage(t, error), values };
  }
  redirect(coachAthletePath(athleteId));
}

/** Borra el deportista gestionado con sus grabaciones (cascada del backend). */
export async function deleteManagedAthlete(athleteId: number): Promise<void> {
  await authedMutation(API_PATHS.coachAthlete(athleteId), { method: "DELETE" });
  redirect(ROUTES.coachAthletes);
}
