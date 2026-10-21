"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";

import { validationMessages } from "../errors";
import { formText, type FormState } from "../form-state";
import { teamGateway } from "../grpc/team-gateway";
import type { Dictionary } from "../i18n";
import { getT } from "../i18n/server";
import { teamPath, teamsPath } from "../routes";
import type { Team } from "../types";
import { validateTeamName } from "../validation";
import { type ImageResult, type ImageUploadStart, mutateImage, startImageUpload } from "./image-uploads";
import { authedMutation, failureMessage } from "./request";

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
    team = await authedMutation(() => teamGateway().create(name));
  } catch (error) {
    return { error: failureMessage(t, error), values: { name } };
  }
  redirect(teamPath(section, team.id));
}

export async function renameTeam(teamId: string, _previous: FormState<TeamField>, formData: FormData): Promise<FormState<TeamField>> {
  const t = await getT();
  const { name, state } = readName(t, formData);
  if (state) return state;
  try {
    await authedMutation(() => teamGateway().rename(teamId, name));
  } catch (error) {
    return { error: failureMessage(t, error), values: { name } };
  }
  refresh();
  return { notice: t.teams.renamed, values: { name } };
}

/** Borra el grupo; los deportistas siguen existiendo. */
export async function deleteTeam(section: TeamSection, teamId: string): Promise<void> {
  await authedMutation(() => teamGateway().delete(teamId));
  redirect(teamsPath(section));
}

/** Agrega (`member` = true) o quita a un deportista del equipo. */
export async function setTeamMember(teamId: string, athleteId: string, member: boolean): Promise<void> {
  await authedMutation(() => (member ? teamGateway().addMember(teamId, athleteId) : teamGateway().removeMember(teamId, athleteId)));
  refresh();
}

/** Logo del equipo con el mismo flujo de dos pasos que el avatar (ligadas con `.bind(null, teamId)`). */
export async function startTeamLogoUpload(teamId: string, type: string, size: number): Promise<ImageUploadStart> {
  return startImageUpload(type, (imageType) => teamGateway().createLogoUpload(teamId, imageType, size));
}

export async function confirmTeamLogoUpload(teamId: string, uploadId: string): Promise<ImageResult> {
  return mutateImage(() => teamGateway().confirmLogoUpload(teamId, uploadId));
}

export async function removeTeamLogo(teamId: string): Promise<ImageResult> {
  return mutateImage(() => teamGateway().deleteLogo(teamId));
}
