import "server-only";

import { cache } from "react";

import { LIST_PAGE_SIZE } from "../server-config";
import { analysisGateway } from "../grpc/analysis-gateway";
import { chatGateway } from "../grpc/chat-gateway";
import type { AnalysisSummary, ChatMessage, JumpAnalysis, SignedUrl } from "../types";
import { authedRead } from "./request";

/** Análisis de un deportista, del más reciente al más antiguo (así los entrega el backend). */
export const listAnalysesByAthlete = cache(
  (athleteId: string): Promise<AnalysisSummary[]> => authedRead(() => analysisGateway().byAthlete(athleteId, LIST_PAGE_SIZE)),
);

/** Un análisis; ajeno o inexistente → notFound (no se revela si existe para otro usuario). */
export const getAnalysis = cache((analysisId: string): Promise<JumpAnalysis> => authedRead(() => analysisGateway().get(analysisId)));

/** URL firmada de vida corta para el <video>: mismo control de acceso que el análisis. */
export function getPlaybackUrl(analysisId: string): Promise<SignedUrl> {
  return authedRead(() => analysisGateway().playbackUrl(analysisId));
}

/** Hilo del chat del usuario de la sesión sobre un análisis (cada usuario tiene el suyo). */
export function listChatMessages(analysisId: string): Promise<ChatMessage[]> {
  return authedRead(() => chatGateway().messages(analysisId));
}
