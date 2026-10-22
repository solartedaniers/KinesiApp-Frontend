import "server-only";

import { notFound } from "next/navigation";
import { cache } from "react";

import { LIST_PAGE_SIZE } from "../server-config";
import { analysisGateway } from "../grpc/analysis-gateway";
import { athleteGateway, managedAthleteGateway } from "../grpc/athlete-gateway";
import { getLocale } from "../i18n/server";
import type { AnalysisSummary, AthleteProfile } from "../types";
import { authedRead } from "./request";

/** Deportistas del coach (gestionados y asignados por un admin), por nombre. */
export const listMyAthletes = cache(async (): Promise<AthleteProfile[]> => {
  const [coached, managed, locale] = await Promise.all([
    authedRead(() => athleteGateway().coached()),
    authedRead(() => managedAthleteGateway().list()),
    getLocale(),
  ]);
  return [...coached, ...managed].sort((a, b) => a.display_name.localeCompare(b.display_name, locale));
});

/** Ficha de un deportista del coach, tomada de su propia lista. Si no es suyo → notFound. */
export async function getMyAthlete(athleteId: string): Promise<AthleteProfile> {
  const athlete = (await listMyAthletes()).find((candidate) => candidate.id === athleteId);
  if (!athlete) notFound();
  return athlete;
}

/** Grabaciones de los deportistas del coach (o de uno de sus equipos), de la más reciente a la más antigua. */
export const listTeamAnalyses = cache(
  (teamId?: string): Promise<AnalysisSummary[]> => authedRead(() => analysisGateway().coached(LIST_PAGE_SIZE, teamId)),
);
