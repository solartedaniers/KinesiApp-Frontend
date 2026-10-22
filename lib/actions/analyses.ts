"use server";

import { redirect, unstable_rethrow } from "next/navigation";

import { analysesListHref } from "../access";
import type { AnalysisEvent } from "../analysis-events";
import { getAnalysis, listChatMessages } from "../data/analyses";
import { getMyAthleteProfile } from "../data/athletes";
import { listMyAthletes } from "../data/coach";
import { getClientPolicy } from "../data/public";
import { validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { analysisGateway } from "../grpc/analysis-gateway";
import { accountGateway } from "../grpc/account-gateway";
import { rpcReason } from "../grpc/errors";
import { getT } from "../i18n/server";
import { openingExplanation, type ReportSource } from "../report";
import { ROUTES, safeNextPath } from "../routes";
import { getCurrentUser } from "../session";
import { MOVEMENT_TYPES, type MovementType, type SignedUrl, type UploadTarget } from "../types";
import { authedMutation, failureMessage } from "./request";

export type VideoUploadRequest = {
  athleteId: string;
  movementType: MovementType;
  contentType: string;
  size: number;
  durationMs: number;
};
export type VideoUploadStart = { target: UploadTarget } | { error: string };
export type VideoUploadConfirmation = { analysisId: string } | { error: string };

/**
 * Paso 1 de la subida: el backend aplica permisos, consentimiento, tamaño y duración antes de que el
 * navegador mande un solo byte, y devuelve la URL firmada del bucket.
 */
export async function startVideoUpload(request: VideoUploadRequest): Promise<VideoUploadStart> {
  const t = await getT();
  if (!(MOVEMENT_TYPES as readonly string[]).includes(request.movementType)) return { error: t.errors.GENERIC };
  try {
    return { target: await authedMutation(() => analysisGateway().createVideoUpload(request)) };
  } catch (error) {
    return { error: failureMessage(t, error) };
  }
}

/** Paso 2: el navegador terminó el PUT; el backend comprueba el objeto y encola el análisis. */
export async function confirmVideoUpload(uploadId: string): Promise<VideoUploadConfirmation> {
  const t = await getT();
  try {
    return { analysisId: (await authedMutation(() => analysisGateway().confirmVideoUpload(uploadId))).id };
  } catch (error) {
    return { error: failureMessage(t, error) };
  }
}

/**
 * Progreso en vivo de WatchAnalysis. Devuelvo un AsyncIterable que React serializa hasta el navegador:
 * así sigue siendo un RPC de punta a punta, sin endpoints propios ni polling.
 */
export async function watchAnalysis(analysisId: string): Promise<AsyncIterable<AnalysisEvent>> {
  return (async function* () {
    try {
      yield* analysisGateway().watch(analysisId);
    } catch (error) {
      yield { kind: "failed", reason: rpcReason(error) } satisfies AnalysisEvent;
    }
  })();
}

/** URL de reproducción nueva cuando la anterior venció; null si ya no se puede ver. */
export async function renewPlaybackUrl(analysisId: string): Promise<SignedUrl | null> {
  try {
    return await authedMutation(() => analysisGateway().playbackUrl(analysisId));
  } catch (error) {
    unstable_rethrow(error);
    return null;
  }
}

export type ReportSourceResult = { source: ReportSource } | { error: string };

/**
 * Datos del informe en PDF al pedirlo: el análisis con sus series, de quién es y la explicación
 * inicial de la IA. Los permisos los aplica el backend en cada lectura, igual que en la pantalla.
 */
export async function getReportSource(analysisId: string): Promise<ReportSourceResult> {
  const t = await getT();
  try {
    const user = await getCurrentUser();
    const [analysis, messages] = await Promise.all([getAnalysis(analysisId), listChatMessages(analysisId)]);
    const athlete = user?.role === "coach" ? (await listMyAthletes()).find((candidate) => candidate.id === analysis.athlete_id) : await getMyAthleteProfile();
    return {
      source: { analysis, athleteName: athlete?.display_name ?? t.report.empty, coachName: athlete?.coach_name ?? null, explanation: openingExplanation(messages) },
    };
  } catch (error) {
    return { error: failureMessage(t, error) };
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
    const { video_consent_version } = await getClientPolicy();
    await authedMutation(() => accountGateway().grantVideoConsent(video_consent_version));
  } catch (error) {
    return { error: failureMessage(t, error) };
  }
  redirect(safeNextPath(next) ?? ROUTES.newAnalysis);
}

/** Borra una grabación con su video; el backend decide si el usuario puede. */
export async function deleteAnalysis(analysisId: string): Promise<void> {
  await authedMutation(() => analysisGateway().delete(analysisId));
  const user = await getCurrentUser();
  redirect(user ? analysesListHref(user.role) : ROUTES.home);
}
