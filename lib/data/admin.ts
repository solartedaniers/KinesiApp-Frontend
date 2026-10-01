import "server-only";

import { cache } from "react";

import { API_PATHS } from "../api-paths";
import { ADMIN_PAGE_SIZE } from "../config";
import { LOCALE } from "../i18n";
import type { AthleteProfile, User } from "../types";
import { authedGetAllPages } from "./request";

const byName = (a: string, b: string) => a.localeCompare(b, LOCALE);

/** Todas las cuentas del sistema (sólo admin), por nombre. */
export const listUsers = cache(async (): Promise<User[]> =>
  (await authedGetAllPages<User>(API_PATHS.users, ADMIN_PAGE_SIZE)).sort((a, b) => byName(a.full_name, b.full_name)),
);

/** Todos los perfiles de deportista, con y sin cuenta (sólo admin), por nombre. */
export const listAllAthletes = cache(async (): Promise<AthleteProfile[]> =>
  (await authedGetAllPages<AthleteProfile>(API_PATHS.athletes, ADMIN_PAGE_SIZE)).sort((a, b) =>
    byName(a.display_name, b.display_name),
  ),
);
