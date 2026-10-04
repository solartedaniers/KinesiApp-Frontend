import "server-only";

import { cache } from "react";

import { API_PATHS } from "../api-paths";
import { ADMIN_PAGE_SIZE } from "../config";
import { getLocale } from "../i18n/server";
import type { AthleteProfile, User } from "../types";
import { authedGetAllPages } from "./request";

/** Todas las cuentas del sistema (sólo admin), por nombre. */
export const listUsers = cache(async (): Promise<User[]> => {
  const [users, locale] = await Promise.all([authedGetAllPages<User>(API_PATHS.users, ADMIN_PAGE_SIZE), getLocale()]);
  return users.sort((a, b) => a.full_name.localeCompare(b.full_name, locale));
});

/** Todos los perfiles de deportista, con y sin cuenta (sólo admin), por nombre. */
export const listAllAthletes = cache(async (): Promise<AthleteProfile[]> => {
  const [athletes, locale] = await Promise.all([
    authedGetAllPages<AthleteProfile>(API_PATHS.athletes, ADMIN_PAGE_SIZE),
    getLocale(),
  ]);
  return athletes.sort((a, b) => a.display_name.localeCompare(b.display_name, locale));
});
