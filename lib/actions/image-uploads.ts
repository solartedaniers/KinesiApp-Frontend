import "server-only";

import { refresh } from "next/cache";

import { type ImageType, isImageType } from "../grpc/uploads";
import { getT } from "../i18n/server";
import type { UploadTarget } from "../types";
import { authedMutation, failureMessage } from "./request";

// Pasos compartidos de las imágenes que suben directo al bucket: avatares y logos de equipo

export type ImageResult = { error?: string };
export type ImageUploadStart = { target: UploadTarget } | { error: string };

/** Paso 1: valida el tipo y pide la URL firmada para que el navegador suba el archivo. */
export async function startImageUpload(type: string, create: (type: ImageType) => Promise<UploadTarget>): Promise<ImageUploadStart> {
  const t = await getT();
  if (!isImageType(type)) return { error: t.avatar.invalidType };
  try {
    return { target: await authedMutation(() => create(type)) };
  } catch (error) {
    return { error: failureMessage(t, error) };
  }
}

/** Paso 2 (confirmar) o borrado: el backend reemplaza la imagen anterior y la página se vuelve a pintar. */
export async function mutateImage(call: () => Promise<unknown>): Promise<ImageResult> {
  const t = await getT();
  try {
    await authedMutation(call);
  } catch (error) {
    return { error: failureMessage(t, error) };
  }
  refresh();
  return {};
}
