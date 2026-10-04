import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";

import { PREFERENCE_COOKIE } from "./config";
import { resolveTheme, type Theme } from "./theme";

/** Tema elegido por el usuario (cookie); por defecto, el del sistema operativo. */
export const getTheme = cache(async (): Promise<Theme> => resolveTheme((await cookies()).get(PREFERENCE_COOKIE.theme)?.value));
