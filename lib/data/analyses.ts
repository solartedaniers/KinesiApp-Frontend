import "server-only";

import { cache } from "react";

import { sortByRecordedDesc } from "../analysis-stats";
import { API_PATHS } from "../api-paths";
import type { JumpAnalysis } from "../types";
import type { VideoAccess } from "../video";
import { authedGet } from "./request";

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
