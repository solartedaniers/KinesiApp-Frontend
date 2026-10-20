import "server-only";

import { cache } from "react";

import { athleteGateway } from "../grpc/athlete-gateway";
import type { AthleteProfile } from "../types";
import { authedReadOrNull } from "./request";

/** Ficha del deportista de la sesión; null si todavía no completó el onboarding (NOT_FOUND). */
export const getMyAthleteProfile = cache(
  (): Promise<AthleteProfile | null> => authedReadOrNull(() => athleteGateway().mine()),
);
