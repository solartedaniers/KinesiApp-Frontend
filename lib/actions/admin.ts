"use server";

import { refresh } from "next/cache";

import { errorMessage } from "../errors";
import { formText } from "../form-state";
import { athleteGateway } from "../grpc/athlete-gateway";
import { userAdminGateway } from "../grpc/user-admin-gateway";
import { getT } from "../i18n/server";
import { USER_ROLES, type UserRole } from "../types";
import { authedMutation, failureMessage } from "./request";

/** Resultado de un control en línea de las tablas de admin: sólo puede fallar o no. */
export type InlineResult = { error?: string };

async function mutate(call: () => Promise<unknown>): Promise<InlineResult> {
  const t = await getT();
  try {
    await authedMutation(call);
  } catch (error) {
    return { error: failureMessage(t, error) };
  }
  refresh();
  return {};
}

/** Cambia el rol de otra cuenta. El backend impide cambiarse el propio y dejar huérfanos a los gestionados. */
export async function changeUserRole(userId: string, _previous: InlineResult, formData: FormData): Promise<InlineResult> {
  const role = formText(formData, "role");
  if (!(USER_ROLES as readonly string[]).includes(role)) return { error: errorMessage(await getT(), null) };
  return mutate(() => userAdminGateway().updateRole(userId, role as UserRole));
}

/** Activa o desactiva otra cuenta: desactivada, no inicia sesión ni renueva la suya. */
export async function setUserActive(userId: string, isActive: boolean): Promise<InlineResult> {
  return mutate(() => userAdminGateway().updateStatus(userId, isActive));
}

export async function assignCoach(athleteId: string, _previous: InlineResult, formData: FormData): Promise<InlineResult> {
  const coachId = formText(formData, "coach_id");
  if (!/^[1-9]\d*$/.test(coachId)) return { error: errorMessage(await getT(), null) };
  return mutate(() => athleteGateway().assignCoach(athleteId, coachId));
}
