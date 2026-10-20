import "server-only";

import { cache } from "react";

import { LIST_PAGE_SIZE } from "../config";
import { athleteGateway } from "../grpc/athlete-gateway";
import { userAdminGateway } from "../grpc/user-admin-gateway";
import { getLocale } from "../i18n/server";
import type { AdminUser, AthleteProfile } from "../types";
import { authedRead } from "./request";

/** Todas las cuentas del sistema (sólo admin), por nombre. */
export const listUsers = cache(async (): Promise<AdminUser[]> => {
  const [users, locale] = await Promise.all([authedRead(() => userAdminGateway().all(LIST_PAGE_SIZE)), getLocale()]);
  return users.sort((a, b) => a.full_name.localeCompare(b.full_name, locale));
});

/** Todos los perfiles de deportista, con y sin cuenta (sólo admin), por nombre. */
export const listAllAthletes = cache(async (): Promise<AthleteProfile[]> => {
  const [athletes, locale] = await Promise.all([authedRead(() => athleteGateway().all(LIST_PAGE_SIZE)), getLocale()]);
  return athletes.sort((a, b) => a.display_name.localeCompare(b.display_name, locale));
});
