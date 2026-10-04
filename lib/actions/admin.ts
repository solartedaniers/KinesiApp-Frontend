"use server";

import { refresh } from "next/cache";

import { API_PATHS } from "../api-paths";
import { errorMessage } from "../errors";
import { formText } from "../form-state";
import type { Dictionary } from "../i18n";
import { getT } from "../i18n/server";
import { USER_ROLES, type UserRole } from "../types";
import { authedMutation } from "./request";

/** Resultado de un control en línea de las tablas de admin: sólo puede fallar o no. */
export type InlineResult = { error?: string };

async function mutate(t: Dictionary, path: string, body: object): Promise<InlineResult> {
  try {
    await authedMutation(path, { method: "PATCH", body });
  } catch (error) {
    return { error: errorMessage(t, error) };
  }
  refresh();
  return {};
}

/** Cambia el rol de otra cuenta. El backend impide cambiarse el propio y dejar huérfanos a los gestionados. */
export async function changeUserRole(userId: number, _previous: InlineResult, formData: FormData): Promise<InlineResult> {
  const t = await getT();
  const role = formText(formData, "role");
  if (!(USER_ROLES as readonly string[]).includes(role)) return { error: errorMessage(t, null) };
  return mutate(t, API_PATHS.userRole(userId), { role: role as UserRole });
}

/** Activa o desactiva otra cuenta: desactivada, no inicia sesión ni renueva la suya. */
export async function setUserActive(userId: number, isActive: boolean): Promise<InlineResult> {
  return mutate(await getT(), API_PATHS.userStatus(userId), { is_active: isActive });
}

export async function assignCoach(athleteId: number, _previous: InlineResult, formData: FormData): Promise<InlineResult> {
  const t = await getT();
  const coachId = Number(formText(formData, "coach_id"));
  if (!Number.isInteger(coachId) || coachId <= 0) return { error: errorMessage(t, null) };
  return mutate(t, API_PATHS.athleteCoach(athleteId), { coach_id: coachId });
}
