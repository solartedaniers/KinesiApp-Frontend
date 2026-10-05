import "server-only";

import { cache } from "react";

import { sortByRecordedDesc } from "../analysis-stats";
import { API_PATHS } from "../api-paths";
import type { ChatMessage, JumpAnalysis } from "../types";
import type { VideoAccess } from "../video";
import { ApiError } from "../errors";
import { authedGet, authedPost } from "./request";

/** Análisis de un deportista, del más reciente al más antiguo (el backend no los ordena). */
export const listAnalysesByAthlete = cache(async (athleteId: number): Promise<JumpAnalysis[]> =>
  sortByRecordedDesc(await authedGet<JumpAnalysis[]>(API_PATHS.analysesByAthlete(athleteId))),
);

/** Un análisis; 403/404 → notFound (no se revela si existe para otro usuario). */
export const getAnalysis = cache((analysisId: number): Promise<JumpAnalysis> =>
  authedGet<JumpAnalysis>(API_PATHS.analysis(analysisId)),
);

/** Token corto para el <video>: mismo control de acceso que el análisis. */
export function getVideoAccess(analysisId: number): Promise<VideoAccess> {
  return authedGet<VideoAccess>(API_PATHS.analysisVideoAccess(analysisId));
}

/** Hilo del chat del usuario de la sesión sobre un análisis (cada usuario tiene el suyo). */
export function listChatMessages(analysisId: number): Promise<ChatMessage[]> {
  return authedGet<ChatMessage[]>(API_PATHS.chatMessages(analysisId));
}

export type ChatOpening = { messages: ChatMessage[]; errorCode?: string };

/**
 * Hilo del chat con la explicación inicial del resultado: el backend la genera la primera vez y
 * después devuelve el hilo tal cual (idempotente). Si el asistente no responde (429, 503) se muestra
 * el hilo que haya y el código del error, para poder preguntar igual.
 */
export async function openChat(analysisId: number): Promise<ChatOpening> {
  try {
    return { messages: await authedPost<ChatMessage[]>(API_PATHS.chatOpening(analysisId)) };
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return { messages: await listChatMessages(analysisId), errorCode: error.code };
  }
}
