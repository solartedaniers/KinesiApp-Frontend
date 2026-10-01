import "server-only";

import { cache } from "react";

import { API_PATHS } from "../api-paths";
import type { AthleteProfile } from "../types";
import { authedGetOrNull } from "./request";

/** Ficha del deportista de la sesión; null si todavía no la completó (404). */
export const getMyAthleteProfile = cache(
  (): Promise<AthleteProfile | null> => authedGetOrNull<AthleteProfile>(API_PATHS.myAthleteProfile),
);
