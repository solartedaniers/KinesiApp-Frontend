import "server-only";

import { cache } from "react";

import { teamGateway } from "../grpc/team-gateway";
import { getLocale } from "../i18n/server";
import type { Team } from "../types";
import { authedRead } from "./request";

/** Equipos del usuario (coach: los suyos; admin: todos), por nombre. */
export const listTeams = cache(async (): Promise<Team[]> => {
  const [teams, locale] = await Promise.all([authedRead(() => teamGateway().list()), getLocale()]);
  return teams.sort((a, b) => a.name.localeCompare(b.name, locale));
});

/** Un equipo; ajeno o inexistente → notFound. */
export const getTeam = cache((teamId: string): Promise<Team> => authedRead(() => teamGateway().get(teamId)));
