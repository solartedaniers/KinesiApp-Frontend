"use server";

import { refresh } from "next/cache";

import { API_PATHS } from "../api-paths";
import type { AvatarPayload } from "../avatar";
import { errorMessage, validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { getT } from "../i18n/server";
import { normalizeFullName, validateFullName } from "../validation";
import { authedMutation } from "./request";

export type ProfileField = "full_name";
export type AvatarResult = { error?: string };

/** Nombre de la cuenta propia (cualquier rol), con la misma regla de sólo letras del registro. */
export async function updateMyName(_previous: FormState<ProfileField>, formData: FormData): Promise<FormState<ProfileField>> {
  const t = await getT();
  const fullName = normalizeFullName(formText(formData, "full_name"));
  const error = validateFullName(fullName);
  if (error) return { fieldErrors: validationMessages(t, { full_name: error }), values: { full_name: fullName } };
  try {
    await authedMutation(API_PATHS.myUser, { method: "PATCH", body: { full_name: fullName } });
  } catch (failure) {
    return { error: errorMessage(t, failure), values: { full_name: fullName } };
  }
  refresh();
  return { notice: t.profile.nameSaved, values: { full_name: fullName } };
}

async function mutateAvatar(path: string, payload: AvatarPayload | null): Promise<AvatarResult> {
  const t = await getT();
  try {
    await authedMutation(path, payload ? { method: "PUT", body: payload } : { method: "DELETE" });
  } catch (error) {
    return { error: errorMessage(t, error) };
  }
  refresh();
  return {};
}

/** Foto propia ya comprimida en el navegador; el backend la guarda en el bucket de imágenes. */
export async function uploadMyAvatar(payload: AvatarPayload): Promise<AvatarResult> {
  return mutateAvatar(API_PATHS.myAvatar, payload);
}

export async function removeMyAvatar(): Promise<AvatarResult> {
  return mutateAvatar(API_PATHS.myAvatar, null);
}

/** Foto de un deportista gestionado por el coach de la sesión. */
export async function uploadManagedAvatar(athleteId: number, payload: AvatarPayload): Promise<AvatarResult> {
  return mutateAvatar(API_PATHS.coachAthleteAvatar(athleteId), payload);
}

export async function removeManagedAvatar(athleteId: number): Promise<AvatarResult> {
  return mutateAvatar(API_PATHS.coachAthleteAvatar(athleteId), null);
}
