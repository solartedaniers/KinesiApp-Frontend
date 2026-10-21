"use server";

import { redirect } from "next/navigation";

import { type BiometricsField, type BiometricsPayload, biometricsRules, readBiometrics } from "../biometrics";
import { getClientPolicy } from "../data/public";
import { validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { todayInAppTimeZone } from "../format";
import { managedAthleteGateway } from "../grpc/athlete-gateway";
import type { Dictionary } from "../i18n";
import { getT } from "../i18n/server";
import { coachAthletePath, ROUTES } from "../routes";
import type { AthleteProfile } from "../types";
import { biometricsParams, type BiometricsRules, normalizeFullName, validateFullName } from "../validation";
import { authedMutation, failureMessage } from "./request";

export type ManagedAthleteField = "full_name" | BiometricsField;

type Reading = {
  values: Partial<Record<ManagedAthleteField, string>>;
  state?: FormState<ManagedAthleteField>;
  fullName: string;
  biometrics?: BiometricsPayload;
};

/** Nombre + ficha biométrica: el coach los captura porque el deportista gestionado no inicia sesión. */
function readManagedAthlete(t: Dictionary, rules: BiometricsRules, formData: FormData): Reading {
  const fullName = normalizeFullName(formText(formData, "full_name"));
  const biometrics = readBiometrics(formData, todayInAppTimeZone(), rules);
  const values = { ...biometrics.values, full_name: fullName };
  const nameError = validateFullName(fullName);
  const errors = { ...(biometrics.errors ?? {}), ...(nameError ? { full_name: nameError } : {}) };
  if (!biometrics.payload || nameError) return { values, fullName, state: { fieldErrors: validationMessages(t, errors, biometricsParams(rules)), values } };
  return { values, fullName, biometrics: biometrics.payload };
}

export async function createManagedAthlete(
  _previous: FormState<ManagedAthleteField>,
  formData: FormData,
): Promise<FormState<ManagedAthleteField>> {
  const [t, policy] = await Promise.all([getT(), getClientPolicy()]);
  const { values, state, fullName, biometrics } = readManagedAthlete(t, biometricsRules(policy), formData);
  if (state || !biometrics) return state ?? {};

  let athlete: AthleteProfile;
  try {
    athlete = await authedMutation(() => managedAthleteGateway().create(fullName, biometrics));
  } catch (error) {
    return { error: failureMessage(t, error), values };
  }
  redirect(coachAthletePath(athlete.id));
}

/** Ligada al deportista con `.bind(null, athleteId)` desde la página de edición. */
export async function updateManagedAthlete(
  athleteId: string,
  _previous: FormState<ManagedAthleteField>,
  formData: FormData,
): Promise<FormState<ManagedAthleteField>> {
  const [t, policy] = await Promise.all([getT(), getClientPolicy()]);
  const { values, state, fullName, biometrics } = readManagedAthlete(t, biometricsRules(policy), formData);
  if (state || !biometrics) return state ?? {};

  try {
    await authedMutation(() => managedAthleteGateway().update(athleteId, fullName, biometrics));
  } catch (error) {
    return { error: failureMessage(t, error), values };
  }
  redirect(coachAthletePath(athleteId));
}

/** Borra el deportista gestionado con sus grabaciones (cascada del backend). */
export async function deleteManagedAthlete(athleteId: string): Promise<void> {
  await authedMutation(() => managedAthleteGateway().delete(athleteId));
  redirect(ROUTES.coachAthletes);
}
