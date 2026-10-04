import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";

import { sortByRecordedDesc } from "../analysis-stats";
import { API_PATHS } from "../api-paths";
import { getLocale } from "../i18n/server";
import type { AthleteProfile, JumpAnalysis } from "../types";
import { authedGet } from "./request";

/** Deportistas del coach (gestionados y asignados por un admin), por nombre. */
export const listMyAthletes = cache(async (): Promise<AthleteProfile[]> => {
  const [athletes, locale] = await Promise.all([authedGet<AthleteProfile[]>(API_PATHS.coachAthletes), getLocale()]);
  return athletes.sort((a, b) => a.display_name.localeCompare(b.display_name, locale));
});

/**
 * Ficha de un deportista del coach, tomada de su propia lista: GET /athletes/{id} del backend no
 * exige autenticación y no se usa. Si no es suyo → notFound.
 */
export async function getMyAthlete(athleteId: number): Promise<AthleteProfile> {
  const athlete = (await listMyAthletes()).find((candidate) => candidate.id === athleteId);
  if (!athlete) notFound();
  return athlete;
}

/** Grabaciones de todo el equipo, de la más reciente a la más antigua. */
export const listTeamAnalyses = cache(async (): Promise<JumpAnalysis[]> =>
  sortByRecordedDesc(await authedGet<JumpAnalysis[]>(API_PATHS.teamAnalyses)),
);
