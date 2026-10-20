"use server";

import { refresh } from "next/cache";

import { validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { accountGateway } from "../grpc/account-gateway";
import { managedAthleteGateway } from "../grpc/athlete-gateway";
import { type ImageType, isImageType } from "../grpc/uploads";
import { getT } from "../i18n/server";
import type { UploadTarget } from "../types";
import { normalizeFullName, validateFullName } from "../validation";
import { authedMutation, failureMessage } from "./request";

export type ProfileField = "full_name";
export type AvatarResult = { error?: string };
export type AvatarUploadStart = { target: UploadTarget } | { error: string };

/** Nombre de la cuenta propia (cualquier rol), con la misma regla de sólo letras del registro. */
export async function updateMyName(_previous: FormState<ProfileField>, formData: FormData): Promise<FormState<ProfileField>> {
  const t = await getT();
  const fullName = normalizeFullName(formText(formData, "full_name"));
  const error = validateFullName(fullName);
  if (error) return { fieldErrors: validationMessages(t, { full_name: error }), values: { full_name: fullName } };
  try {
    await authedMutation(() => accountGateway().updateName(fullName));
  } catch (failure) {
    return { error: failureMessage(t, failure), values: { full_name: fullName } };
  }
  refresh();
  return { notice: t.profile.nameSaved, values: { full_name: fullName } };
}

async function startUpload(type: string, create: (type: ImageType) => Promise<UploadTarget>): Promise<AvatarUploadStart> {
  const t = await getT();
  if (!isImageType(type)) return { error: t.avatar.invalidType };
  try {
    return { target: await authedMutation(() => create(type)) };
  } catch (error) {
    return { error: failureMessage(t, error) };
  }
}

async function mutateAvatar(call: () => Promise<unknown>): Promise<AvatarResult> {
  const t = await getT();
  try {
    await authedMutation(call);
  } catch (error) {
    return { error: failureMessage(t, error) };
  }
  refresh();
  return {};
}

/** Paso 1 de la foto propia: URL firmada para que el navegador la suba directo al bucket. */
export async function startMyAvatarUpload(type: string, size: number): Promise<AvatarUploadStart> {
  return startUpload(type, (imageType) => accountGateway().createAvatarUpload(imageType, size));
}

/** Paso 2: el backend comprueba el objeto subido y reemplaza la foto anterior. */
export async function confirmMyAvatarUpload(uploadId: string): Promise<AvatarResult> {
  return mutateAvatar(() => accountGateway().confirmAvatarUpload(uploadId));
}

export async function removeMyAvatar(): Promise<AvatarResult> {
  return mutateAvatar(() => accountGateway().deleteAvatar());
}

/** Lo mismo para un deportista gestionado por el coach de la sesión (ligadas con `.bind(null, athleteId)`). */
export async function startManagedAvatarUpload(athleteId: string, type: string, size: number): Promise<AvatarUploadStart> {
  return startUpload(type, (imageType) => managedAthleteGateway().createAvatarUpload(athleteId, imageType, size));
}

export async function confirmManagedAvatarUpload(athleteId: string, uploadId: string): Promise<AvatarResult> {
  return mutateAvatar(() => managedAthleteGateway().confirmAvatarUpload(athleteId, uploadId));
}

export async function removeManagedAvatar(athleteId: string): Promise<AvatarResult> {
  return mutateAvatar(() => managedAthleteGateway().deleteAvatar(athleteId));
}
