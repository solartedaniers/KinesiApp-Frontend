import "server-only";

import { cache } from "react";

import { API_PATHS } from "../api-paths";
import { getLocale } from "../i18n/server";
import type { Team } from "../types";
import { authedGet } from "./request";

/** Equipos del usuario (coach: los suyos; admin: todos), por nombre. */
export const listTeams = cache(async (): Promise<Team[]> => {
  const [teams, locale] = await Promise.all([authedGet<Team[]>(API_PATHS.teams), getLocale()]);
  return teams.sort((a, b) => a.name.localeCompare(b.name, locale));
});

/** Un equipo; ajeno o inexistente → notFound. */
export const getTeam = cache((teamId: number): Promise<Team> => authedGet<Team>(API_PATHS.team(teamId)));
