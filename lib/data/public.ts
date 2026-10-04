import "server-only";

import { cache } from "react";

import { apiRequest } from "../api";
import { API_PATHS } from "../api-paths";
import type { VideoLimits } from "../types";

/** Versión vigente del texto de consentimiento: la que exige el backend para subir videos. */
export const getVideoConsentVersion = cache(
  async (): Promise<number> => (await apiRequest<{ version: number }>(API_PATHS.publicVideoConsent)).version,
);

/** Límites de subida que aplica el backend: el cliente valida antes de mandar el archivo. */
export const getVideoLimits = cache((): Promise<VideoLimits> => apiRequest<VideoLimits>(API_PATHS.publicVideoLimits));
