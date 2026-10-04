"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { API_PATHS } from "../api-paths";
import { errorMessage, validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import type { Dictionary } from "../i18n";
import { getT } from "../i18n/server";
import { teamPath, teamsPath } from "../routes";
import type { Team } from "../types";
import { validateTeamName } from "../validation";
import { authedMutation } from "./request";

export type TeamField = "name";
type TeamSection = "coach" | "admin";

function readName(t: Dictionary, formData: FormData): { name: string; state?: FormState<TeamField> } {
  const name = formText(formData, "name").trim();
  const error = validateTeamName(name);
  return error ? { name, state: { fieldErrors: validationMessages(t, { name: error }), values: { name } } } : { name };
}

/** Crea el equipo y abre su página para asignarle deportistas. */
export async function createTeam(section: TeamSection, _previous: FormState<TeamField>, formData: FormData): Promise<FormState<TeamField>> {
  const t = await getT();
  const { name, state } = readName(t, formData);
  if (state) return state;
  let team: Team;
  try {
    team = await authedMutation<Team>(API_PATHS.teams, { method: "POST", body: { name } });
  } catch (error) {
    return { error: errorMessage(t, error), values: { name } };
  }
  redirect(teamPath(section, team.id));
}

export async function renameTeam(teamId: number, _previous: FormState<TeamField>, formData: FormData): Promise<FormState<TeamField>> {
  const t = await getT();
  const { name, state } = readName(t, formData);
  if (state) return state;
  try {
    await authedMutation(API_PATHS.team(teamId), { method: "PATCH", body: { name } });
  } catch (error) {
    return { error: errorMessage(t, error), values: { name } };
  }
  refresh();
  return { notice: t.teams.renamed, values: { name } };
}

/** Borra el grupo; los deportistas siguen existiendo. */
export async function deleteTeam(section: TeamSection, teamId: number): Promise<void> {
  await authedMutation(API_PATHS.team(teamId), { method: "DELETE" });
  redirect(teamsPath(section));
}

/** Agrega (`member` = true) o quita a un deportista del equipo. */
export async function setTeamMember(teamId: number, athleteId: number, member: boolean): Promise<void> {
  await authedMutation(API_PATHS.teamMember(teamId, athleteId), { method: member ? "PUT" : "DELETE" });
  refresh();
}
