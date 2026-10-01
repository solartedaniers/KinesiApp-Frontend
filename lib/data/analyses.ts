import "server-only";

import { cache } from "react";

import { sortByRecordedDesc } from "../analysis-stats";
import { API_PATHS } from "../api-paths";
import type { JumpAnalysis } from "../types";
import { authedGet } from "./request";

/** Análisis de un deportista, del más reciente al más antiguo (el backend no los ordena). */
export const listAnalysesByAthlete = cache(async (athleteId: number): Promise<JumpAnalysis[]> =>
  sortByRecordedDesc(await authedGet<JumpAnalysis[]>(API_PATHS.analysesByAthlete(athleteId))),
);
