"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { type BiometricsField, readBiometrics } from "../biometrics";
import { validationMessages } from "../errors";
import type { FormState } from "../form-state";
import { todayInAppTimeZone } from "../format";
import { athleteGateway } from "../grpc/athlete-gateway";
import { getT } from "../i18n/server";
import { ROUTES } from "../routes";
import { authedMutation, failureMessage } from "./request";

/** Alta obligatoria de la ficha del deportista (primer ingreso): al guardarla entra a la app. */
export async function createMyProfile(
  _previous: FormState<BiometricsField>,
  formData: FormData,
): Promise<FormState<BiometricsField>> {
  const t = await getT();
  const { values, errors, payload } = readBiometrics(formData, todayInAppTimeZone());
  if (!payload) return { fieldErrors: validationMessages(t, errors ?? {}), values };

  try {
    await authedMutation(() => athleteGateway().createMine(payload));
  } catch (error) {
    return { error: failureMessage(t, error), values };
  }
  redirect(ROUTES.home);
}

/** Edición de la ficha desde el perfil. La edad no se edita: sale de la fecha de nacimiento. */
export async function updateMyProfile(
  _previous: FormState<BiometricsField>,
  formData: FormData,
): Promise<FormState<BiometricsField>> {
  const t = await getT();
  const { values, errors, payload } = readBiometrics(formData, todayInAppTimeZone());
  if (!payload) return { fieldErrors: validationMessages(t, errors ?? {}), values };

  try {
    await authedMutation(() => athleteGateway().updateMine(payload));
  } catch (error) {
    return { error: failureMessage(t, error), values };
  }
  refresh();
  return { notice: t.biometrics.saved, values };
}
