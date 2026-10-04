"use server";

import { redirect } from "next/navigation";

import { analysesListHref } from "../access";
import { API_PATHS } from "../api-paths";
import { getVideoConsentVersion } from "../data/public";
import { errorMessage, validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { getT } from "../i18n/server";
import { ROUTES, safeNextPath } from "../routes";
import { getCurrentUser } from "../session";
import type { VideoUploadToken } from "../types";
import { authedMutation } from "./request";

export type UploadTokenResult = { token: string } | { error: string };

/**
 * Token para que el navegador suba el video directo a la API. El backend aplica aquí las mismas
 * reglas que en la subida (dueño o coach del gestionado, consentimiento), así el error sale antes de
 * mandar el archivo.
 */
export async function requestUploadToken(athleteId: number): Promise<UploadTokenResult> {
  const t = await getT();
  try {
    const { token } = await authedMutation<VideoUploadToken>(API_PATHS.uploadToken, { method: "POST", body: { athlete_id: athleteId } });
    return { token };
  } catch (error) {
    return { error: errorMessage(t, error) };
  }
}

export type ConsentField = "accept";

/** Acepta la versión vigente del consentimiento y vuelve a la subida (`next`, sólo rutas internas). */
export async function grantVideoConsent(
  next: string,
  _previous: FormState<ConsentField>,
  formData: FormData,
): Promise<FormState<ConsentField>> {
  const t = await getT();
  if (formText(formData, "accept") !== "on") return { fieldErrors: validationMessages(t, { accept: "consentRequired" }) };
  try {
    const version = await getVideoConsentVersion();
    await authedMutation(API_PATHS.myVideoConsent, { method: "POST", body: { version } });
  } catch (error) {
    return { error: errorMessage(t, error) };
  }
  redirect(safeNextPath(next) ?? ROUTES.newAnalysis);
}

/** Borra una grabación con su video; el backend decide si el usuario puede. */
export async function deleteAnalysis(analysisId: number): Promise<void> {
  await authedMutation(API_PATHS.analysis(analysisId), { method: "DELETE" });
  const user = await getCurrentUser();
  redirect(user ? analysesListHref(user.role) : ROUTES.home);
}
